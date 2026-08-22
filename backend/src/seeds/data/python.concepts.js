export const pythonConcepts = [
  {
    term: "a Python list",
    tags: ["collections", "basics"],
    definition:
      "an ordered mutable sequence that can hold values of mixed types and grow on demand",
    facts: [
      "appending to the end is amortised constant time",
      "a list can be modified in place after creation",
      "slicing a list produces a new shallow copy",
    ],
    myths: [
      "a list requires every element to share the same type",
      "assigning one list to another name creates an independent copy",
    ],
  },
  {
    term: "a tuple",
    tags: ["collections", "immutability"],
    definition:
      "an ordered immutable sequence whose contents cannot be reassigned after creation",
    facts: [
      "a tuple can be used as a dictionary key when its contents are hashable",
      "unpacking assigns its elements to several names at once",
      "a single-element tuple needs a trailing comma",
    ],
    myths: [
      "a tuple supports the append method",
      "a tuple containing a list is always hashable",
    ],
  },
  {
    term: "a dictionary",
    tags: ["collections", "hashing"],
    definition:
      "a mapping from hashable keys to values with average constant-time lookup",
    facts: [
      "keys must be hashable, which rules out lists",
      "insertion order is preserved from Python 3.7 onwards",
      "get returns a default instead of raising when the key is absent",
    ],
    myths: [
      "a list can be used directly as a dictionary key",
      "indexing a missing key returns None",
    ],
  },
  {
    term: "a list comprehension",
    tags: ["syntax", "idioms"],
    definition:
      "an expression that builds a list by iterating and optionally filtering in a single construct",
    facts: [
      "it usually reads more clearly than an explicit append loop",
      "a generator expression is the lazy equivalent that avoids building the list",
      "comprehensions can be nested to flatten a sequence of sequences",
    ],
    myths: [
      "a comprehension leaks its loop variable into the enclosing scope in Python 3",
      "a comprehension always uses less memory than an equivalent loop",
    ],
  },
  {
    term: "a decorator",
    tags: ["functions", "patterns"],
    definition:
      "a callable that wraps another function to extend its behaviour without editing its body",
    facts: [
      "the at syntax is shorthand for reassigning the name to the wrapped function",
      "functools.wraps preserves the original name and docstring",
      "decorators stack from the innermost outwards",
    ],
    myths: [
      "a decorator modifies the source of the function it wraps",
      "a decorator can only be applied to functions and never to classes",
    ],
    code: {
      title: "Write a retry decorator that re-runs the wrapped function up to n times on exception.",
      language: "python",
      starterCode: "def retry(times):\n    # return a decorator\n    pass\n",
      explanation:
        "use functools.wraps on the inner wrapper and re-raise the last exception once the attempts are exhausted",
      testCases: [
        { input: "function fails twice then succeeds, times=3", expectedOutput: "success", isHidden: false },
        { input: "function always fails, times=2, attempts made", expectedOutput: "2", isHidden: false },
        { input: "wrapped function __name__", expectedOutput: "original name", isHidden: true },
      ],
    },
  },
  {
    term: "a generator in Python",
    tags: ["iterators", "memory"],
    definition:
      "a function using yield that produces values one at a time without holding them all in memory",
    facts: [
      "it keeps memory use flat regardless of how many values it produces",
      "calling it returns a generator object without executing the body",
      "it can be iterated only once",
    ],
    myths: [
      "a generator can be iterated repeatedly like a list",
      "a generator supports indexing with square brackets",
    ],
  },
  {
    term: "the global interpreter lock",
    tags: ["concurrency", "internals"],
    definition:
      "the CPython lock that permits only one thread to execute Python bytecode at any moment",
    facts: [
      "it prevents threads from giving true parallel speedup to CPU-bound Python code",
      "IO-bound work still benefits from threads because the lock is released while waiting",
      "multiprocessing sidesteps it by using separate interpreter processes",
    ],
    myths: [
      "the lock makes every operation on a shared object atomic and race-free",
      "threads give linear speedup for CPU-bound Python work",
    ],
  },
  {
    term: "a mutable default argument",
    tags: ["functions", "pitfalls"],
    definition:
      "a default value evaluated once at definition time and then shared by every call that omits it",
    facts: [
      "the default object persists across calls and accumulates changes",
      "using None as the default and creating the object inside avoids the trap",
      "the default expression is evaluated when the def statement runs",
    ],
    myths: [
      "the default value is freshly created on every call",
      "the problem only affects lists and not dictionaries",
    ],
  },
  {
    term: "the with statement",
    tags: ["context-managers", "resources"],
    definition:
      "a construct that acquires a resource and guarantees its release even when the block raises",
    facts: [
      "the context manager's exit method runs even if an exception propagates",
      "a class implementing enter and exit can be used with it",
      "contextlib.contextmanager builds one from a generator",
    ],
    myths: [
      "the with statement suppresses any exception raised inside its block",
      "the release step is skipped when the block raises",
    ],
  },
  {
    term: "an f-string",
    tags: ["strings", "syntax"],
    definition:
      "a string literal that evaluates the expressions embedded in its braces at run time",
    facts: [
      "any valid expression can appear inside the braces",
      "format specifiers control padding, precision and alignment",
      "the equals suffix prints both the expression and its value for debugging",
    ],
    myths: [
      "an f-string is evaluated lazily when the string is later used",
      "f-strings are slower than the older percent formatting",
    ],
  },
  {
    term: "duck typing",
    tags: ["typing", "philosophy"],
    definition:
      "the principle that an object's suitability depends on the methods it supports rather than its class",
    facts: [
      "code depends on behaviour rather than on an inheritance relationship",
      "it is often expressed as asking forgiveness rather than permission",
      "protocols let static type checkers describe it explicitly",
    ],
    myths: [
      "duck typing means Python performs no type checking at all",
      "an object must inherit from a base class to be accepted by such code",
    ],
  },
  {
    term: "a type hint",
    tags: ["typing", "tooling"],
    definition:
      "an annotation describing the expected types of parameters and return values for tools to check",
    facts: [
      "the interpreter does not enforce annotations at run time",
      "external checkers such as mypy use them to catch errors before execution",
      "they are exposed at run time through the annotations attribute",
    ],
    myths: [
      "a type hint raises a TypeError when the wrong type is passed",
      "annotations are stripped and unavailable at run time",
    ],
  },
  {
    term: "a virtual environment",
    tags: ["tooling", "packaging"],
    definition:
      "an isolated directory holding its own interpreter link and packages for one project",
    facts: [
      "it keeps each project's dependency versions independent",
      "activating it puts its interpreter first on the path",
      "the environment directory is normally excluded from version control",
    ],
    myths: [
      "a virtual environment isolates the operating system libraries as well",
      "packages installed inside it are visible to the system interpreter",
    ],
  },
  {
    term: "the equality and identity operators",
    tags: ["operators", "semantics"],
    definition:
      "the pair where one compares values and the other compares whether two names refer to the same object",
    facts: [
      "identity should be used for comparing against None",
      "equality can be customised by defining the eq method",
      "small integers and short strings may be interned and share identity",
    ],
    myths: [
      "identity comparison is a faster way of testing for equal values",
      "two lists with identical contents share the same identity",
    ],
  },
  {
    term: "exception handling",
    tags: ["errors", "control-flow"],
    definition:
      "the try structure that catches a raised error and optionally runs else and finally blocks",
    facts: [
      "finally runs whether or not an exception was raised",
      "the else block runs only when the try body completed without raising",
      "catching a broad Exception hides bugs you did not intend to handle",
    ],
    myths: [
      "finally is skipped when the try block returns a value",
      "a bare except clause is good practice for robustness",
    ],
  },
  {
    term: "a shallow copy",
    tags: ["objects", "memory"],
    definition:
      "a new container whose elements are still references to the same nested objects as the original",
    facts: [
      "mutating a nested object is visible through both copies",
      "copy.deepcopy recursively duplicates the nested structure",
      "list slicing and dict.copy both produce shallow copies",
    ],
    myths: [
      "a shallow copy duplicates every nested object as well",
      "assignment to a new name creates a shallow copy",
    ],
  },
  {
    term: "the args and kwargs syntax",
    tags: ["functions", "syntax"],
    definition:
      "the parameter forms that collect any extra positional arguments into a tuple and keyword arguments into a dict",
    facts: [
      "the starred parameter collects extra positional arguments as a tuple",
      "the double-starred parameter collects extra keyword arguments as a dict",
      "the same operators unpack a sequence or mapping at the call site",
    ],
    myths: [
      "the names args and kwargs are required by the language",
      "the starred parameter collects keyword arguments too",
    ],
  },
  {
    term: "the method resolution order",
    tags: ["oop", "inheritance"],
    definition:
      "the deterministic sequence in which Python searches base classes for an attribute",
    facts: [
      "it is computed with the C3 linearisation algorithm",
      "the mro attribute exposes the computed order",
      "super follows this order rather than jumping straight to a named parent",
    ],
    myths: [
      "super always calls the class listed first in the bases",
      "multiple inheritance resolves attributes purely left to right by depth",
    ],
  },
  {
    term: "asyncio",
    tags: ["async", "concurrency"],
    definition:
      "the standard library framework running coroutines cooperatively on a single-threaded event loop",
    facts: [
      "a coroutine only yields control at an await expression",
      "a blocking call inside a coroutine stalls the entire loop",
      "gather schedules several coroutines to progress concurrently",
    ],
    myths: [
      "asyncio runs coroutines in parallel across CPU cores",
      "calling a coroutine function on its own starts running it",
    ],
    code: {
      title: "Write fetch_all(urls) with asyncio so every request is issued concurrently.",
      language: "python",
      starterCode: "async def fetch_all(urls):\n    # gather the results\n    pass\n",
      explanation: "create the tasks first, then await them together so the requests overlap",
      testCases: [
        { input: "3 urls each taking 1s, total elapsed", expectedOutput: "about 1s", isHidden: false },
        { input: "results length for 3 urls", expectedOutput: "3", isHidden: false },
        { input: "empty url list", expectedOutput: "[]", isHidden: true },
      ],
    },
  },
  {
    term: "the dunder name check",
    tags: ["modules", "idioms"],
    definition:
      "the guard that runs a block only when the file is executed directly rather than imported",
    facts: [
      "the module attribute equals main only for the script that was run",
      "it keeps import side effects out of a reusable module",
      "multiprocessing on some platforms requires this guard to work correctly",
    ],
    myths: [
      "the guarded block runs whenever the module is imported",
      "the guard is required in every Python file",
    ],
  },
];
