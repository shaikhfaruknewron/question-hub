import dns from "dns";
import { ENV } from "./env.js";

/**
 * Points Node's DNS resolver at explicit servers when DNS_SERVERS is set.
 *
 * `mongodb+srv://` needs an SRV lookup, which goes through dns.resolveSrv and
 * therefore queries whatever servers Windows has configured. When those are
 * broken (a leftover 127.0.0.1 from an uninstalled VPN, for example) the lookup
 * fails even though ordinary hostname resolution still works, because
 * dns.lookup() goes through the OS resolver instead.
 *
 * Setting DNS_SERVERS=8.8.8.8,1.1.1.1 fixes the app without touching Windows
 * network settings (which usually needs administrator rights).
 */
export const applyDnsOverride = () => {
  if (ENV.DNS_SERVERS.length === 0) return false;

  try {
    dns.setServers(ENV.DNS_SERVERS);
    console.log(`[dns] Using DNS servers: ${ENV.DNS_SERVERS.join(", ")}`);
    return true;
  } catch (error) {
    console.warn(`[dns] Ignoring invalid DNS_SERVERS value: ${error.message}`);
    return false;
  }
};
