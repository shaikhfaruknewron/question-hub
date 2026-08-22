export const networkingConcepts = [
  {
    term: "the TCP protocol",
    tags: ["transport", "protocols"],
    definition:
      "a connection-oriented transport protocol that delivers an ordered, reliable byte stream",
    facts: [
      "a three-way handshake establishes the connection before data flows",
      "lost segments are retransmitted until they are acknowledged",
      "the receiver reassembles segments into their original order",
    ],
    myths: [
      "TCP preserves the boundaries between individual application messages",
      "TCP guarantees a minimum delivery latency",
    ],
  },
  {
    term: "the UDP protocol",
    tags: ["transport", "protocols"],
    definition:
      "a connectionless transport protocol that sends independent datagrams with no delivery guarantee",
    facts: [
      "datagrams may arrive out of order, duplicated or not at all",
      "it avoids handshake and retransmission overhead",
      "it suits live video, voice and game traffic where latency beats completeness",
    ],
    myths: [
      "UDP retransmits a datagram that fails to arrive",
      "UDP is unusable for any application that needs reliability",
    ],
  },
  {
    term: "the DNS system",
    tags: ["naming", "infrastructure"],
    definition:
      "the distributed directory that resolves human-readable names into the addresses used to reach a host",
    facts: [
      "resolvers cache answers for the duration given by the record's TTL",
      "an A record maps a name to an IPv4 address and a CNAME maps it to another name",
      "resolution walks from the root servers down through the authoritative servers",
    ],
    myths: [
      "DNS lookups are always answered by one central server",
      "a DNS change takes effect for every client immediately",
    ],
  },
  {
    term: "the HTTP protocol",
    tags: ["application", "web"],
    definition:
      "a stateless request and response protocol in which each message carries its own context",
    facts: [
      "the server keeps no memory of previous requests between them",
      "cookies and tokens are how applications add session state on top",
      "HTTP/2 multiplexes many requests over one connection",
    ],
    myths: [
      "HTTP keeps a per-client session open at the protocol level",
      "keep-alive makes the protocol stateful",
    ],
  },
  {
    term: "TLS",
    tags: ["security", "protocols"],
    definition:
      "the layer that gives a connection encryption, integrity and server authentication through certificates",
    facts: [
      "the handshake uses asymmetric keys to agree a symmetric session key",
      "the certificate chain proves the server owns the name being requested",
      "an expired or mismatched certificate causes the client to refuse the connection",
    ],
    myths: [
      "TLS encrypts the destination IP address of the packets",
      "TLS by itself authenticates the client to the server",
    ],
  },
  {
    term: "an HTTP status code",
    tags: ["http", "api"],
    definition:
      "a three-digit code whose leading digit classifies the response as informational, success, redirect, client error or server error",
    facts: [
      "a 4xx code means the client's request was at fault",
      "a 5xx code means the server failed while handling a valid request",
      "301 signals a permanent redirect and 302 a temporary one",
    ],
    myths: [
      "a 200 response body can never describe an application-level failure",
      "404 and 500 both indicate a client mistake",
    ],
  },
  {
    term: "an IP address",
    tags: ["network-layer", "addressing"],
    definition:
      "the network-layer identifier that tells routers where to deliver a packet",
    facts: [
      "IPv4 addresses are 32 bits and IPv6 addresses are 128 bits",
      "private ranges are not routable across the public internet",
      "a subnet mask splits an address into its network and host parts",
    ],
    myths: [
      "an IP address uniquely identifies one physical device forever",
      "every device on the internet has a globally unique public address",
    ],
  },
  {
    term: "a port number",
    tags: ["transport", "addressing"],
    definition:
      "the 16-bit number that identifies which service on a host a transport connection belongs to",
    facts: [
      "ports below 1024 are the well-known range and often need elevated privileges",
      "a connection is identified by the pair of address and port on each side",
      "two processes cannot listen on the same port and address at once",
    ],
    myths: [
      "the port number is part of the IP header",
      "TCP port 80 and UDP port 80 are the same endpoint",
    ],
  },
  {
    term: "NAT",
    tags: ["routing", "addressing"],
    definition:
      "the rewriting of addresses at a router so many private hosts can share one public address",
    facts: [
      "the router keeps a translation table mapping internal sessions to external ports",
      "it lets a whole network sit behind a single public address",
      "inbound connections need explicit forwarding rules to reach an internal host",
    ],
    myths: [
      "NAT is a complete substitute for a firewall",
      "a host behind NAT can accept unsolicited inbound connections without configuration",
    ],
  },
  {
    term: "a load balancer",
    tags: ["infrastructure", "scaling"],
    definition:
      "a component that spreads incoming requests across a pool of backend servers",
    facts: [
      "health checks remove an unresponsive backend from the pool",
      "sticky sessions pin a client to the same backend across requests",
      "it terminates TLS in many deployments so backends serve plain HTTP internally",
    ],
    myths: [
      "a load balancer removes the need to run more than one backend instance",
      "round-robin routing accounts for how loaded each backend actually is",
    ],
  },
  {
    term: "a WebSocket connection",
    tags: ["realtime", "protocols"],
    definition:
      "a long-lived full-duplex channel established by upgrading an ordinary HTTP connection",
    facts: [
      "either side can send a message at any time once the upgrade completes",
      "the handshake starts as a normal HTTP request with an upgrade header",
      "it avoids the per-message overhead of repeated polling",
    ],
    myths: [
      "a WebSocket message is delivered with an HTTP request and response pair",
      "WebSockets work without any initial HTTP exchange",
    ],
  },
  {
    term: "the OSI model",
    tags: ["theory", "layering"],
    definition:
      "a seven-layer reference model that separates networking concerns from the physical medium up to the application",
    facts: [
      "each layer offers a service to the layer directly above it",
      "routers operate at the network layer and switches at the data link layer",
      "the practical TCP/IP stack collapses several of these layers together",
    ],
    myths: [
      "the OSI model describes exactly how the internet is implemented",
      "TCP operates at the network layer",
    ],
  },
  {
    term: "a firewall",
    tags: ["security", "infrastructure"],
    definition:
      "a control that permits or blocks traffic according to rules about addresses, ports and protocols",
    facts: [
      "a stateful firewall tracks connections and allows the matching return traffic",
      "a default-deny policy is safer than allowing everything not explicitly blocked",
      "egress rules matter as much as ingress rules for containing a compromise",
    ],
    myths: [
      "a firewall inspects the contents of encrypted traffic by default",
      "blocking inbound traffic alone is sufficient protection",
    ],
  },
  {
    term: "a CDN",
    tags: ["infrastructure", "performance"],
    definition:
      "a network of edge servers that cache content near users to cut latency and origin load",
    facts: [
      "cache headers decide how long an edge node keeps a response",
      "serving from a nearby edge reduces round-trip time significantly",
      "a purge is required to remove stale content before its TTL expires",
    ],
    myths: [
      "a CDN caches every response including personalised ones by default",
      "a CDN removes the need for an origin server",
    ],
  },
  {
    term: "network latency",
    tags: ["performance", "theory"],
    definition:
      "the time a single packet takes to travel from sender to receiver",
    facts: [
      "latency is bounded from below by the physical distance and the speed of light",
      "extra round trips hurt more than extra bytes on a high-latency link",
      "bandwidth and latency are independent properties of a link",
    ],
    myths: [
      "adding bandwidth reduces latency",
      "latency is negligible once a connection is already established",
    ],
  },
  {
    term: "an HTTP cache header",
    tags: ["http", "caching"],
    definition:
      "a response header that tells clients and proxies how long a response may be reused and how to revalidate it",
    facts: [
      "max-age sets the number of seconds a response stays fresh",
      "an ETag lets the client revalidate and receive a 304 when nothing changed",
      "no-store forbids writing the response to any cache",
    ],
    myths: [
      "no-cache means the response is never stored anywhere",
      "a cached response is always served without contacting the server again",
    ],
  },
  {
    term: "the DHCP protocol",
    tags: ["infrastructure", "addressing"],
    definition:
      "the protocol that hands a joining host an address along with its gateway and resolver settings",
    facts: [
      "an address is leased for a limited time and must be renewed",
      "the same exchange supplies the default gateway and DNS servers",
      "a reservation ties a specific host to a fixed address",
    ],
    myths: [
      "a DHCP address is assigned permanently to a device",
      "DHCP also resolves domain names",
    ],
  },
  {
    term: "a proxy server",
    tags: ["infrastructure", "http"],
    definition:
      "an intermediary that forwards requests on behalf of a client or a server",
    facts: [
      "a forward proxy acts for the client and a reverse proxy acts for the server",
      "a reverse proxy commonly handles TLS termination and caching",
      "the original client address is usually carried in a forwarded header",
    ],
    myths: [
      "a proxy always hides the client's identity from the destination",
      "a forward proxy and a reverse proxy are configured on the same side",
    ],
  },
  {
    term: "packet switching",
    tags: ["theory", "network-layer"],
    definition:
      "the technique of splitting data into packets that are routed independently and reassembled at the destination",
    facts: [
      "different packets of one message can take different routes",
      "it shares link capacity between many conversations",
      "the receiver uses sequence information to restore the original order",
    ],
    myths: [
      "packets from one message always travel the same path in order",
      "packet switching reserves a dedicated circuit for each conversation",
    ],
  },
  {
    term: "an idempotent HTTP method",
    tags: ["http", "api"],
    definition:
      "a method whose repeated application has the same effect on the server as applying it once",
    facts: [
      "GET, PUT and DELETE are defined as idempotent",
      "idempotency makes safe automatic retries possible",
      "POST is not idempotent, which is why retrying it can duplicate a resource",
    ],
    myths: [
      "an idempotent request must return an identical response body every time",
      "POST is idempotent because it validates its input",
    ],
  },
];
