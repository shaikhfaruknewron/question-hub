export const nodejsConcepts = [
  {
    term: "the Node.js event loop",
    tags: ["async", "runtime"],
    definition:
      "the libuv-driven loop that moves through timers, pending callbacks, poll, check and close phases on each turn",
    facts: [
      "callbacks registered with setImmediate run in the check phase",
      "process.nextTick callbacks run before the loop moves to the next phase",
      "a blocking synchronous call stalls every phase of the loop",
    ],
    myths: [
      "Node.js runs application JavaScript on many threads by default",
      "setTimeout with zero delay always fires before setImmediate",
    ],
  },
  {
    term: "a Node.js stream",
    tags: ["streams", "io"],
    definition:
      "an interface for processing data in chunks as it arrives instead of loading it all into memory",
    facts: [
      "pipe connects a readable stream to a writable one and handles backpressure",
      "streams keep memory usage flat regardless of the total payload size",
      "pipeline propagates errors and cleans up every stream in the chain",
    ],
    myths: [
      "a stream must be fully buffered before any chunk can be processed",
      "pipe forwards errors from the source to the destination automatically",
    ],
  },
  {
    term: "middleware in Express",
    tags: ["express", "http"],
    definition:
      "a function receiving the request, the response and next, which runs in the order it was registered",
    facts: [
      "calling next passes control to the following middleware in the stack",
      "an error-handling middleware is identified by its four parameters",
      "a middleware that neither responds nor calls next leaves the request hanging",
    ],
    myths: [
      "middleware order in the file has no effect on execution",
      "returning a value from middleware ends the request automatically",
    ],
  },
  {
    term: "the CommonJS module system",
    tags: ["modules", "runtime"],
    definition:
      "Node's original module format where require loads a module synchronously and exports is a mutable object",
    facts: [
      "require resolves and executes the module the first time it is loaded",
      "the loaded module is cached under its resolved path",
      "reassigning module.exports replaces the whole exported value",
    ],
    myths: [
      "require re-executes the module file on every call",
      "CommonJS and ES modules can be mixed with no interop considerations",
    ],
  },
  {
    term: "the process.env object",
    tags: ["configuration", "runtime"],
    definition: "the map of environment variables the process was started with, whose values are strings",
    facts: [
      "every value read from it is a string, including numeric settings",
      "it is the standard place to keep secrets out of source control",
      "assigning to it affects only the current process and its children",
    ],
    myths: [
      "process.env preserves the original types of the values",
      "changes to process.env are written back to the shell that launched the process",
    ],
  },
  {
    term: "an EventEmitter",
    tags: ["events", "patterns"],
    definition:
      "a class that lets an object publish named events and invoke every listener registered for them synchronously",
    facts: [
      "listeners for one event fire in the order they were added",
      "an error event with no listener throws and can crash the process",
      "once registers a listener that is removed after its first call",
    ],
    myths: [
      "emit schedules listeners asynchronously on the next tick",
      "an unhandled error event is silently ignored",
    ],
  },
  {
    term: "the cluster module",
    tags: ["scaling", "processes"],
    definition:
      "a module that forks the application into several worker processes sharing one listening port",
    facts: [
      "each worker is a separate process with its own memory",
      "the number of workers is usually matched to the available CPU cores",
      "workers cannot share in-process state such as a local cache",
    ],
    myths: [
      "clustered workers share a single JavaScript heap",
      "clustering makes a CPU-bound function itself run faster",
    ],
  },
  {
    term: "a worker thread",
    tags: ["concurrency", "performance"],
    definition:
      "a real thread that runs JavaScript in its own isolate so CPU-heavy work does not block the main loop",
    facts: [
      "workers communicate through message passing rather than shared variables",
      "SharedArrayBuffer is the exception that allows shared memory",
      "spawning a worker has real startup cost, so a pool is usually preferred",
    ],
    myths: [
      "worker threads are the right tool for scaling ordinary IO-bound requests",
      "a worker thread shares its parent's variables directly",
    ],
  },
  {
    term: "the package.json file",
    tags: ["npm", "tooling"],
    definition:
      "the manifest describing a package's metadata, dependencies, scripts and module resolution settings",
    facts: [
      "the type field decides whether .js files are treated as ESM or CommonJS",
      "devDependencies are not installed for a production install",
      "the scripts field defines the commands npm run can execute",
    ],
    myths: [
      "package.json records the exact resolved version of every transitive dependency",
      "the engines field prevents installation on an unsupported Node version by default",
    ],
  },
  {
    term: "semantic versioning",
    tags: ["npm", "dependencies"],
    definition:
      "a version scheme where the major, minor and patch numbers signal breaking, additive and fix-only changes",
    facts: [
      "the caret range allows minor and patch upgrades but not a major one",
      "the tilde range allows only patch upgrades",
      "a lockfile pins the exact versions actually installed",
    ],
    myths: [
      "the caret range permits automatic upgrades across a major version",
      "a version below 1.0.0 follows the same compatibility rules",
    ],
  },
  {
    term: "JSON Web Token authentication",
    tags: ["auth", "security"],
    definition:
      "a scheme where the server issues a signed token the client returns on later requests to prove identity",
    facts: [
      "the payload is base64url encoded and readable by anyone holding the token",
      "the signature proves the token was issued by the server and not altered",
      "a stateless token cannot be revoked before it expires without extra storage",
    ],
    myths: [
      "the payload of a JWT is encrypted and hidden from the client",
      "changing the payload and re-encoding it produces a token the server accepts",
    ],
  },
  {
    term: "password hashing with bcrypt",
    tags: ["auth", "security"],
    definition:
      "a deliberately slow one-way hash with a per-password salt and a tunable cost factor",
    facts: [
      "the salt is stored inside the resulting hash string",
      "raising the cost factor makes brute-force attacks proportionally more expensive",
      "verification re-hashes the candidate password and compares the digests",
    ],
    myths: [
      "a bcrypt hash can be reversed to recover the original password",
      "hashing the same password twice produces the same bcrypt output",
    ],
    code: {
      title: "Write registerUser(email, password) that hashes the password before saving the record.",
      language: "javascript",
      starterCode:
        "async function registerUser(email, password) {\n  // hash with a cost factor, then persist\n}\n",
      explanation:
        "never store or log the plain password, and let the hashing library generate the salt",
      testCases: [
        { input: "same password registered twice, stored hashes equal?", expectedOutput: "false", isHidden: false },
        { input: "stored value equals the plain password?", expectedOutput: "false", isHidden: false },
        { input: "verify(correct password) result", expectedOutput: "true", isHidden: true },
      ],
    },
  },
  {
    term: "CORS",
    tags: ["http", "security"],
    definition:
      "a browser mechanism where a server uses response headers to declare which other origins may read its responses",
    facts: [
      "the browser enforces the policy, not the server",
      "a preflight OPTIONS request precedes requests that are not simple",
      "credentialed requests cannot be paired with a wildcard origin",
    ],
    myths: [
      "CORS prevents other servers from calling the API directly",
      "a CORS error means the request never reached the server",
    ],
  },
  {
    term: "an HTTP-only cookie",
    tags: ["auth", "security"],
    definition: "a cookie the browser refuses to expose to JavaScript running on the page",
    facts: [
      "it limits the damage a cross-site scripting flaw can do to a session token",
      "the browser still attaches it automatically to matching requests",
      "the secure attribute restricts it to HTTPS connections",
    ],
    myths: [
      "an HTTP-only cookie can be read with document.cookie",
      "the flag by itself protects against cross-site request forgery",
    ],
  },
  {
    term: "rate limiting",
    tags: ["security", "api"],
    definition:
      "a control that caps how many requests a client may make in a time window and rejects the excess",
    facts: [
      "the usual rejection status code is 429",
      "a shared store is needed once the API runs on more than one instance",
      "it protects login endpoints from credential stuffing",
    ],
    myths: [
      "an in-memory limiter works correctly across several server instances",
      "rate limiting removes the need for authentication on an endpoint",
    ],
  },
  {
    term: "graceful shutdown",
    tags: ["operations", "reliability"],
    definition:
      "the practice of refusing new connections and finishing in-flight work before the process exits",
    facts: [
      "the process listens for SIGTERM to begin the shutdown sequence",
      "open database connections should be closed before exiting",
      "a timeout is needed so a stuck request cannot block the exit forever",
    ],
    myths: [
      "calling process.exit immediately lets pending responses finish",
      "SIGKILL can be intercepted to run cleanup code",
    ],
  },
  {
    term: "an unhandled promise rejection",
    tags: ["errors", "async"],
    definition:
      "a rejected promise that no catch handler ever observes, which terminates modern Node processes",
    facts: [
      "recent Node versions exit the process by default when it happens",
      "an async function called without await hides its rejection",
      "a top-level handler is useful for logging before the process exits",
    ],
    myths: [
      "an unhandled rejection is always logged and safely ignored",
      "a try and catch block around a non-awaited async call catches its rejection",
    ],
  },
  {
    term: "the async local storage API",
    tags: ["async", "observability"],
    definition:
      "an API that keeps a value available across an asynchronous call chain without passing it as an argument",
    facts: [
      "it is the usual way to carry a request id through nested async calls",
      "each asynchronous context gets its own isolated store",
      "it removes the need to thread context through every function signature",
    ],
    myths: [
      "the stored value is shared globally across concurrent requests",
      "it works by attaching data to the global object",
    ],
  },
  {
    term: "input validation on the server",
    tags: ["security", "api"],
    definition:
      "the check that every incoming payload matches an expected shape before the handler acts on it",
    facts: [
      "server-side validation is required even when the client already validates",
      "a schema library rejects unexpected fields as well as wrong types",
      "validation errors should return a 400 rather than a 500",
    ],
    myths: [
      "validation in the browser is sufficient for a public API",
      "type annotations in the source enforce shapes at runtime",
    ],
  },
  {
    term: "structured logging",
    tags: ["observability", "operations"],
    definition:
      "the practice of emitting logs as machine-parsable records with consistent fields instead of free text",
    facts: [
      "a correlation id lets you follow one request across services",
      "log levels let production filter out debug noise",
      "secrets and tokens must be redacted before a record is written",
    ],
    myths: [
      "console.log with string concatenation is equivalent to structured logging",
      "logging the full request body is a safe default",
    ],
  },
];
