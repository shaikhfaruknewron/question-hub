/**
 * Connection diagnostics.
 *
 *   npm run doctor
 *
 * Checks each step between this machine and MongoDB separately, so a failure
 * points at the actual cause (DNS, firewall, credentials) instead of a single
 * opaque driver error. Safe to share the output — credentials are redacted.
 */
import dns from "dns";
import net from "net";
import os from "os";
import { ENV } from "./config/env.js";
import { applyDnsOverride } from "./config/dns.js";

const ok = (msg) => console.log(`  [ok]    ${msg}`);
const bad = (msg) => console.log(`  [FAIL]  ${msg}`);
const info = (msg) => console.log(`  [info]  ${msg}`);
const section = (title) => console.log(`\n${title}`);

const problems = [];

const parseUri = (uri) => {
  const match = uri.match(
    /^(mongodb(?:\+srv)?):\/\/(?:([^:@/]+)(?::([^@/]*))?@)?([^/?]+)(?:\/([^?]*))?(?:\?(.*))?$/
  );
  if (!match) return null;
  return {
    scheme: match[1],
    username: match[2] || null,
    hasPassword: Boolean(match[3]),
    hosts: match[4].split(",").map((h) => h.trim()),
    database: match[5] || null,
    options: match[6] || "",
  };
};

const resolveSrvWith = (name, servers) =>
  new Promise((resolve) => {
    const resolver = new dns.Resolver();
    if (servers) resolver.setServers(servers);
    resolver.resolveSrv(name, (err, records) =>
      resolve(err ? { error: err } : { records })
    );
  });

const lookupHost = (host) =>
  new Promise((resolve) => {
    dns.lookup(host, (err, address) => resolve(err ? { error: err } : { address }));
  });

const tcpProbe = (host, port, timeout = 8000) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => done({ open: true }));
    socket.once("timeout", () => done({ error: "timed out" }));
    socket.once("error", (err) => done({ error: err.message }));
    socket.connect(port, host);
  });

const run = async () => {
  console.log("\n=========== Question Hub connection doctor ===========");

  section("Environment");
  info(`Node ${process.version} on ${os.platform()} ${os.release()}`);

  const systemServers = dns.getServers();
  info(`System DNS servers: ${systemServers.join(", ") || "(none)"}`);

  // A loopback resolver means a local DNS proxy is expected to be listening.
  // When one isn't (usually an uninstalled VPN or ad blocker), every SRV lookup
  // is refused while ordinary hostname lookups still work via the OS resolver.
  const loopbackOnly =
    systemServers.length > 0 &&
    systemServers.every((s) => s === "127.0.0.1" || s === "::1");

  if (loopbackOnly) {
    bad("Your DNS server is set to your own machine (127.0.0.1) and nothing is listening there");
    info("Usually left behind by an uninstalled VPN or DNS filter (WARP, NordVPN, Pi-hole, AdGuard)");
  }

  const overridden = applyDnsOverride();
  if (overridden) {
    ok(`DNS_SERVERS override active: ${ENV.DNS_SERVERS.join(", ")}`);
  } else if (loopbackOnly) {
    info("No DNS_SERVERS override set in .env");
  }

  section("Connection string");
  const uri = ENV.MONGO_URI;
  const parsed = parseUri(uri);

  if (!parsed) {
    bad("MONGO_URI could not be parsed. It must start with mongodb:// or mongodb+srv://");
    info(`Got: ${uri.slice(0, 20)}...`);
    problems.push("MONGO_URI is malformed");
    console.log("\n=====================================================\n");
    process.exit(1);
  }

  const isSrv = parsed.scheme === "mongodb+srv";
  info(`Scheme:    ${parsed.scheme}${isSrv ? "  (requires a DNS SRV lookup)" : "  (direct hosts, no SRV lookup)"}`);
  info(`Username:  ${parsed.username || "(none)"}`);
  info(`Password:  ${parsed.hasPassword ? "(set, redacted)" : "(none)"}`);
  info(`Hosts:     ${parsed.hosts.join(", ")}`);
  info(`Database:  ${ENV.DB_NAME}`);
  info(`Options:   ${parsed.options || "(none)"}`);

  if (parsed.hasPassword && /[@:/?#[\]]/.test(decodeURIComponent(parsed.username || ""))) {
    bad("Username contains characters that must be percent-encoded");
    problems.push("Credentials need percent-encoding");
  }

  let hosts = parsed.hosts;

  if (isSrv) {
    section("Step 1 — SRV record lookup (this is what 'querySrv' refers to)");
    const srvName = `_mongodb._tcp.${parsed.hosts[0]}`;
    info(`Looking up ${srvName}`);

    const viaSystem = await resolveSrvWith(srvName);
    const viaPublic = await resolveSrvWith(srvName, ["8.8.8.8", "1.1.1.1"]);

    if (viaSystem.records) {
      ok(`System DNS resolved ${viaSystem.records.length} host(s)`);
      hosts = viaSystem.records.map((r) => `${r.name}:${r.port}`);
    } else {
      bad(`System DNS failed: ${viaSystem.error.code || viaSystem.error.message}`);
    }

    if (viaPublic.records) {
      ok(`Public DNS (8.8.8.8) resolved ${viaPublic.records.length} host(s)`);
      if (!viaSystem.records) {
        hosts = viaPublic.records.map((r) => `${r.name}:${r.port}`);
        problems.push(
          "Your system DNS refuses SRV queries but 8.8.8.8 answers them.\n" +
            "     Easiest fix (no admin rights needed) — add this line to backend/.env:\n" +
            "         DNS_SERVERS=8.8.8.8,1.1.1.1\n" +
            "     Or fix it system-wide: set your adapter's DNS to 8.8.8.8 / 1.1.1.1,\n" +
            "     then run 'ipconfig /flushdns'."
        );
      }
    } else {
      bad(`Public DNS (8.8.8.8) failed too: ${viaPublic.error.code || viaPublic.error.message}`);
      if (!viaSystem.records) {
        problems.push(
          "No DNS server reachable for SRV lookups — you are offline, behind a VPN,\n" +
            "     or a firewall is blocking outbound DNS (port 53).\n" +
            "     Fix: disconnect the VPN, or use the non-SRV 'mongodb://' form (see README)."
        );
      }
    }

    if (!viaSystem.records && !viaPublic.records) {
      console.log("\nCannot continue without the host list.");
      report();
      return;
    }
  } else {
    section("Step 1 — SRV record lookup");
    ok("Skipped: the connection string lists hosts directly");
  }

  section("Step 2 — Hostname resolution (A records)");
  for (const hostPort of hosts) {
    const host = hostPort.split(":")[0];
    const result = await lookupHost(host);
    if (result.address) ok(`${host} -> ${result.address}`);
    else {
      bad(`${host}: ${result.error.code || result.error.message}`);
      problems.push(`Cannot resolve ${host}`);
    }
  }

  section("Step 3 — TCP reachability on port 27017");
  let anyOpen = false;
  for (const hostPort of hosts) {
    const [host, port = "27017"] = hostPort.split(":");
    const result = await tcpProbe(host, Number(port));
    if (result.open) {
      ok(`${host}:${port} is reachable`);
      anyOpen = true;
    } else {
      bad(`${host}:${port} — ${result.error}`);
    }
  }
  if (!anyOpen) {
    problems.push(
      "Port 27017 is blocked on this network (common on office/college Wi-Fi).\n" +
        "     Changing DNS will NOT help. Try a mobile hotspot, or ask for 27017 to be opened."
    );
  }

  section("Step 4 — MongoDB handshake and authentication");
  try {
    const mongoose = (await import("mongoose")).default;
    const conn = await mongoose.connect(uri, {
      dbName: ENV.DB_NAME,
      serverSelectionTimeoutMS: 15000,
    });
    ok(`Connected to ${conn.connection.host}/${conn.connection.name}`);
    const collections = await conn.connection.db.listCollections().toArray();
    ok(`Collections: ${collections.map((c) => c.name).join(", ") || "(none — run: npm run seed)"}`);
    await mongoose.connection.close();
  } catch (error) {
    bad(error.message);
    if (/Authentication failed|bad auth/i.test(error.message)) {
      problems.push(
        "Credentials rejected. Check the username/password in .env, and remember that\n" +
          "     special characters in the password must be percent-encoded."
      );
    } else if (/querySrv|_mongodb\._tcp/i.test(error.message)) {
      problems.push(
        "The driver's own SRV lookup failed even though the checks above passed.\n" +
          "     Add this line to backend/.env so Node uses a working resolver:\n" +
          "         DNS_SERVERS=8.8.8.8,1.1.1.1"
      );
    } else if (/timed out|ServerSelection/i.test(error.message)) {
      problems.push(
        "Reached DNS but not the server. Add your current IP under\n" +
          "     Atlas > Network Access, or allow 0.0.0.0/0 temporarily to confirm."
      );
    } else {
      // Never let a failed handshake fall through to an "everything works" verdict.
      problems.push(`Could not connect: ${error.message}`);
    }
  }

  report();
};

function report() {
  console.log("\n----------------------- Verdict -----------------------");
  if (problems.length === 0) {
    console.log("  Everything works. Start the API with: npm run dev");
  } else {
    problems.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  }
  console.log("=======================================================\n");
  process.exit(problems.length ? 1 : 0);
}

run().catch((error) => {
  console.error("\n[doctor] Crashed:", error);
  process.exit(1);
});
