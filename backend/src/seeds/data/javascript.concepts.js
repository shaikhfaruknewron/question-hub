export const javascriptConcepts = [
  {
    term: "a closure",
    tags: ["functions", "scope"],
    definition:
      "a function that keeps a live reference to the variables of the scope it was created in, even after that scope has returned",
    facts: [
      "a closure keeps its captured variables alive after the outer function has returned",
      "closures are how JavaScript models private state without using classes",
      "a function defined inside another function closes over the outer function's variables",
    ],
    myths: [
      "a closure copies the outer variables by value at the moment it is created",
      "closures only work inside functions declared with the function keyword",
    ],
    code: {
      title: "Write a makeCounter factory that uses a closure to keep its count private.",
      language: "javascript",
      starterCode: "function makeCounter() {\n  // return an object with increment() and value()\n}\n",
      explanation:
        "the counter variable must live in makeCounter's scope so nothing outside can reassign it",
      testCases: [
        { input: "const c = makeCounter(); c.increment(); c.increment(); c.value()", expectedOutput: "2", isHidden: false },
        { input: "const c = makeCounter(); c.value()", expectedOutput: "0", isHidden: false },
        { input: "const a = makeCounter(); const b = makeCounter(); a.increment(); b.value()", expectedOutput: "0", isHidden: true },
      ],
    },
  },
  {
    term: "hoisting",
    tags: ["scope", "declarations"],
    definition:
      "the way declarations are registered in their scope before any code runs, so the binding exists before the line that declares it",
    facts: [
      "function declarations are fully initialised before the surrounding code executes",
      "let and const bindings sit in the temporal dead zone until their declaration is evaluated",
      "a var declaration is initialised to undefined before its assignment runs",
    ],
    myths: [
      "let and const are not hoisted at all",
      "hoisting physically moves the source lines to the top of the file",
    ],
  },
  {
    term: "the event loop",
    tags: ["async", "runtime"],
    definition:
      "the scheduler that drains the call stack, then the microtask queue, then one macrotask at a time",
    facts: [
      "microtasks such as promise callbacks run before the next timer callback",
      "a long synchronous block starves every queued callback until it finishes",
      "the event loop only picks up a queued task once the call stack is empty",
    ],
    myths: [
      "setTimeout with a delay of 0 runs the callback immediately",
      "JavaScript runs promise callbacks on a separate thread",
    ],
  },
  {
    term: "a Promise",
    tags: ["async", "es6"],
    definition:
      "an object representing a value that is not available yet, which settles exactly once as fulfilled or rejected",
    facts: [
      "a promise can settle only once, and later resolve or reject calls are ignored",
      "then always returns a new promise, which is what makes chaining work",
      "a rejection with no handler surfaces as an unhandled rejection warning",
    ],
    myths: [
      "a promise can move from fulfilled back to pending",
      "creating a promise makes the work inside it run asynchronously",
    ],
  },
  {
    term: "the const declaration",
    tags: ["variables", "es6"],
    definition:
      "a block-scoped binding that cannot be reassigned after its initial value is set",
    facts: [
      "a const binding must be initialised at the point of declaration",
      "the object a const points at can still have its properties changed",
      "const is scoped to the nearest enclosing block, not the enclosing function",
    ],
    myths: [
      "const makes the value it holds deeply immutable",
      "a const declared inside an if block is visible after the block ends",
    ],
  },
  {
    term: "the prototype chain",
    tags: ["objects", "inheritance"],
    definition:
      "the linked list of objects the engine walks when a property is not found on the object itself",
    facts: [
      "property lookup stops at the first object in the chain that owns the key",
      "Object.create lets you set an object's prototype explicitly",
      "the chain ends at null, which is why unknown properties resolve to undefined",
    ],
    myths: [
      "class syntax replaced prototypes with real copy-based inheritance",
      "assigning to a property writes it onto the prototype rather than the object",
    ],
  },
  {
    term: "the this binding",
    tags: ["functions", "context"],
    definition: "a value decided by how a function is called rather than where it was written",
    facts: [
      "calling a function as obj.method() binds this to obj",
      "call, apply and bind set this explicitly",
      "an arrow function has no this of its own and reads it from the enclosing scope",
    ],
    myths: [
      "this always refers to the object where the function was defined",
      "bind mutates the original function instead of returning a new one",
    ],
  },
  {
    term: "an arrow function",
    tags: ["functions", "es6"],
    definition:
      "a compact function form that inherits this, arguments and new.target from its enclosing scope",
    facts: [
      "an arrow function cannot be used as a constructor with new",
      "arrow functions have no arguments object of their own",
      "a concise arrow body returns its expression without a return keyword",
    ],
    myths: [
      "arrow functions are only shorter syntax with identical semantics",
      "an arrow function used as an object method binds this to that object",
    ],
  },
  {
    term: "destructuring",
    tags: ["syntax", "es6"],
    definition:
      "a syntax that pulls values out of arrays or objects into distinct bindings in one statement",
    facts: [
      "a default value applies only when the destructured value is undefined",
      "object destructuring can rename a key on the way out",
      "a rest element collects every remaining entry into a new array or object",
    ],
    myths: [
      "destructuring a null value simply yields undefined bindings",
      "array destructuring matches by property name rather than position",
    ],
  },
  {
    term: "spread syntax",
    tags: ["syntax", "es6"],
    definition:
      "an operator that expands an iterable or an object's own enumerable properties into a new target",
    facts: [
      "spreading an object produces a shallow copy, not a deep one",
      "a later spread overwrites keys contributed by an earlier one",
      "spread works on any iterable, including strings, sets and maps",
    ],
    myths: [
      "spread performs a deep clone of nested objects",
      "spread and rest are the same operator doing the same job",
    ],
  },
  {
    term: "strict equality",
    tags: ["operators", "types"],
    definition: "a comparison that returns true only when both operands share the same type and value",
    facts: [
      "strict equality never performs type coercion",
      "NaN is not strictly equal to itself",
      "two distinct objects are never strictly equal even with identical contents",
    ],
    myths: [
      "strict equality compares objects by their property values",
      "null and undefined are strictly equal to each other",
    ],
  },
  {
    term: "NaN",
    tags: ["numbers", "types"],
    definition:
      "the numeric value representing the result of an arithmetic operation that has no meaningful number",
    facts: [
      "typeof NaN evaluates to the string number",
      "Number.isNaN checks for NaN without coercing its argument",
      "any arithmetic expression involving NaN produces NaN",
    ],
    myths: [
      "NaN equals NaN when compared with the equality operator",
      "the global isNaN behaves identically to Number.isNaN",
    ],
  },
  {
    term: "event delegation",
    tags: ["dom", "events"],
    definition:
      "a pattern that attaches one listener to a common ancestor and identifies the real target during bubbling",
    facts: [
      "delegation keeps working for elements added to the DOM later",
      "it replaces many per-element listeners with a single ancestor listener",
      "the handler inspects event.target to decide which child was acted on",
    ],
    myths: [
      "event delegation requires a listener on every matching child element",
      "focus and blur bubble, so delegation works for them without adjustment",
    ],
  },
  {
    term: "debouncing",
    tags: ["performance", "events"],
    definition:
      "a technique that delays running a function until a quiet period has passed since the last call",
    facts: [
      "each new call during the waiting window restarts the timer",
      "debouncing suits search inputs where only the final value matters",
      "throttling differs by guaranteeing a run at a fixed maximum rate",
    ],
    myths: [
      "debouncing runs the function on every call but more slowly",
      "debouncing and throttling produce the same call pattern",
    ],
    code: {
      title: "Implement debounce(fn, waitMs) so fn runs only after calls stop for waitMs.",
      language: "javascript",
      starterCode: "function debounce(fn, waitMs) {\n  // return the wrapped function\n}\n",
      explanation:
        "clear the pending timer on every call so only the final invocation survives the quiet period",
      testCases: [
        { input: "three calls 10ms apart, waitMs 50, call count after 200ms", expectedOutput: "1", isHidden: false },
        { input: "two calls 100ms apart, waitMs 50, call count after 300ms", expectedOutput: "2", isHidden: false },
        { input: "debounced with argument x, value fn receives", expectedOutput: "x", isHidden: true },
      ],
    },
  },
  {
    term: "the Map collection",
    tags: ["collections", "es6"],
    definition:
      "a keyed collection that accepts values of any type as keys and preserves insertion order",
    facts: [
      "a Map can use an object or a function as a key",
      "map.size reports the entry count directly",
      "iterating a Map yields entries in the order they were inserted",
    ],
    myths: [
      "a Map converts its keys to strings the way a plain object does",
      "JSON.stringify serialises a Map's entries",
    ],
  },
  {
    term: "a Symbol",
    tags: ["types", "es6"],
    definition:
      "a primitive whose every instance is unique, used for property keys that cannot collide",
    facts: [
      "two symbols created with the same description are still different values",
      "symbol keys are skipped by Object.keys and JSON.stringify",
      "well-known symbols such as Symbol.iterator hook into language protocols",
    ],
    myths: [
      "Symbol values can be created with the new operator",
      "symbol-keyed properties are completely hidden from reflection",
    ],
  },
  {
    term: "a generator function",
    tags: ["functions", "iterators"],
    definition: "a function that can pause at each yield and resume later, producing values on demand",
    facts: [
      "calling a generator returns an iterator without running the body",
      "each next call resumes execution until the following yield",
      "a generator can receive a value back through the argument passed to next",
    ],
    myths: [
      "a generator runs its whole body on the first call and buffers the results",
      "generators are asynchronous by nature",
    ],
    code: {
      title: "Write a generator range(start, end, step) that yields its values lazily.",
      language: "javascript",
      starterCode: "function* range(start, end, step = 1) {\n  // yield each value\n}\n",
      explanation: "yield inside a loop so nothing is computed until the consumer asks for it",
      testCases: [
        { input: "spread of range(1, 5)", expectedOutput: "[1,2,3,4]", isHidden: false },
        { input: "spread of range(0, 10, 5)", expectedOutput: "[0,5]", isHidden: false },
        { input: "spread of range(3, 3)", expectedOutput: "[]", isHidden: true },
      ],
    },
  },
  {
    term: "async and await",
    tags: ["async", "es2017"],
    definition:
      "syntax that lets promise-based code read sequentially while still yielding control at each await",
    facts: [
      "an async function always returns a promise regardless of what it returns",
      "await suspends only the async function, never the whole thread",
      "a rejected awaited promise throws and can be caught with try and catch",
    ],
    myths: [
      "await blocks the event loop until the promise settles",
      "awaiting inside a loop runs the iterations concurrently",
    ],
    code: {
      title: "Write fetchAllSettled(urls) so every request runs concurrently and each outcome is reported.",
      language: "javascript",
      starterCode: "async function fetchAllSettled(urls) {\n  // return an array of { url, ok }\n}\n",
      explanation:
        "start every request before awaiting so the calls overlap instead of running one after another",
      testCases: [
        { input: "two urls that both succeed", expectedOutput: "[{ok:true},{ok:true}]", isHidden: false },
        { input: "one url that fails", expectedOutput: "[{ok:false}]", isHidden: false },
        { input: "an empty list of urls", expectedOutput: "[]", isHidden: true },
      ],
    },
  },
  {
    term: "optional chaining",
    tags: ["operators", "es2020"],
    definition:
      "an operator that short-circuits to undefined when the value on its left is null or undefined",
    facts: [
      "the whole chain stops evaluating as soon as it short-circuits",
      "it works for property access, index access and function calls",
      "it pairs naturally with the nullish coalescing operator for defaults",
    ],
    myths: [
      "optional chaining swallows every error thrown inside the expression",
      "it short-circuits on any falsy value such as zero or an empty string",
    ],
  },
  {
    term: "an ES module",
    tags: ["modules", "es6"],
    definition:
      "a file with its own top-level scope whose exports are resolved statically before execution",
    facts: [
      "imports are hoisted and evaluated before the importing module's body runs",
      "a module's bindings are live, so an exported value updates for its importers",
      "every module is evaluated once and cached for later imports",
    ],
    myths: [
      "import statements can be placed conditionally inside an if block",
      "module code runs in the non-strict sloppy mode by default",
    ],
  },
];
