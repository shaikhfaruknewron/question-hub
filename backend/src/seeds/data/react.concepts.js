export const reactConcepts = [
  {
    term: "a React component",
    tags: ["components", "basics"],
    definition:
      "a function that receives props and returns the element tree describing what should appear on screen",
    facts: [
      "a component must return a single root element or a fragment",
      "a component name has to start with a capital letter to be treated as a component",
      "the same props should always produce the same rendered output",
    ],
    myths: [
      "a component may mutate the props object it receives",
      "returning several sibling elements without a wrapper is valid",
    ],
  },
  {
    term: "props",
    tags: ["components", "data-flow"],
    definition:
      "the read-only inputs a parent passes down to a child to configure what that child renders",
    facts: [
      "props flow in one direction from parent to child",
      "a child changes parent data by calling a callback the parent supplied",
      "children is the prop that carries whatever was nested inside the tag",
    ],
    myths: [
      "a child can assign to a prop to update the parent's state",
      "props and state are interchangeable ways of storing the same data",
    ],
  },
  {
    term: "the useState hook",
    tags: ["hooks", "state"],
    definition:
      "a hook that gives a component a value that survives re-renders together with a setter that triggers one",
    facts: [
      "calling the setter schedules a re-render rather than changing the value immediately",
      "the updater form receives the latest value and avoids stale reads",
      "setting state to the identical value lets React skip the re-render",
    ],
    myths: [
      "the state variable updates synchronously on the line after the setter call",
      "mutating the existing state object and re-setting it triggers a render",
    ],
  },
  {
    term: "the useEffect hook",
    tags: ["hooks", "side-effects"],
    definition:
      "a hook that runs a side effect after render and re-runs it when the listed dependencies change",
    facts: [
      "an empty dependency array runs the effect only after the first render",
      "returning a function from the effect registers its cleanup",
      "omitting the dependency array re-runs the effect after every render",
    ],
    myths: [
      "useEffect runs before the browser paints the screen",
      "the cleanup function only runs when the component unmounts",
    ],
  },
  {
    term: "the key prop",
    tags: ["lists", "reconciliation"],
    definition:
      "the identity React uses to match a list item with its previous element across renders",
    facts: [
      "a key only needs to be unique among its siblings",
      "using the array index as a key breaks state when the list is reordered",
      "changing an element's key makes React unmount it and mount a fresh one",
    ],
    myths: [
      "the key prop can be read inside the component like any other prop",
      "keys must be globally unique across the whole application",
    ],
  },
  {
    term: "the virtual DOM",
    tags: ["rendering", "internals"],
    definition:
      "an in-memory element tree React diffs against the previous one to work out the smallest real DOM update",
    facts: [
      "React compares the new tree with the previous one before touching the DOM",
      "only the differing nodes are written to the real DOM",
      "a render pass can happen without producing any DOM mutation at all",
    ],
    myths: [
      "the virtual DOM is always faster than a hand-written direct DOM update",
      "every render replaces the entire real DOM subtree",
    ],
  },
  {
    term: "the useMemo hook",
    tags: ["hooks", "performance"],
    definition:
      "a hook that caches the result of a computation and recomputes it only when its dependencies change",
    facts: [
      "it is a performance optimisation, not a correctness guarantee",
      "React may discard a memoised value and recompute it",
      "it also keeps object identity stable for downstream dependency arrays",
    ],
    myths: [
      "wrapping every calculation in useMemo makes an app faster",
      "a memoised value is guaranteed to be kept for the component's whole lifetime",
    ],
  },
  {
    term: "the useCallback hook",
    tags: ["hooks", "performance"],
    definition:
      "a hook that returns the same function instance between renders while its dependencies are unchanged",
    facts: [
      "it matters when a function is passed to a memoised child or an effect dependency",
      "a stale dependency list captures outdated values inside the callback",
      "it is equivalent to useMemo returning a function",
    ],
    myths: [
      "useCallback prevents the wrapped function from running",
      "it stops the component that defines the callback from re-rendering",
    ],
  },
  {
    term: "the React context API",
    tags: ["state", "composition"],
    definition:
      "a mechanism for passing a value down the tree without threading it through every intermediate component",
    facts: [
      "every consumer re-renders when the provider's value changes identity",
      "a component reads the value from the nearest provider above it",
      "context is a delivery mechanism rather than a state manager",
    ],
    myths: [
      "context updates skip re-rendering the components that consume it",
      "context replaces the need for any local component state",
    ],
  },
  {
    term: "a controlled input",
    tags: ["forms", "state"],
    definition:
      "a form field whose displayed value comes from state and whose changes are pushed back through a handler",
    facts: [
      "the rendered value always reflects the current state",
      "passing a value without an onChange makes the field read-only",
      "an uncontrolled input keeps its value in the DOM node instead",
    ],
    myths: [
      "a controlled input keeps its own value inside the DOM element",
      "controlled and uncontrolled modes can be switched freely during a component's life",
    ],
  },
  {
    term: "the rules of hooks",
    tags: ["hooks", "constraints"],
    definition:
      "the requirement that hooks are called in the same order on every render, at the top level of a component",
    facts: [
      "a hook must not be called inside a condition or a loop",
      "hooks may only be called from components or from other hooks",
      "React matches hook state to hook position by call order",
    ],
    myths: [
      "a hook can be called conditionally as long as the condition is stable",
      "hooks work inside ordinary utility functions",
    ],
  },
  {
    term: "the useRef hook",
    tags: ["hooks", "dom"],
    definition:
      "a hook that returns a mutable container which persists across renders without causing a re-render",
    facts: [
      "assigning to ref.current never schedules a render",
      "passing a ref to a DOM element gives you the underlying node",
      "it is the usual home for timer ids and other mutable instance data",
    ],
    myths: [
      "updating a ref re-renders the component like state does",
      "the ref for a DOM element is populated before the first render completes",
    ],
  },
  {
    term: "React.memo",
    tags: ["performance", "rendering"],
    definition:
      "a wrapper that skips re-rendering a component when its props are shallowly equal to the previous ones",
    facts: [
      "it compares props shallowly by default",
      "a new inline object or function prop defeats the comparison every render",
      "a custom comparison function can be supplied as the second argument",
    ],
    myths: [
      "React.memo performs a deep comparison of props",
      "a memoised component never re-renders once its props settle",
    ],
  },
  {
    term: "lifting state up",
    tags: ["state", "composition"],
    definition:
      "the practice of moving shared state into the closest common ancestor of the components that need it",
    facts: [
      "it keeps two siblings in sync through a single source of truth",
      "the ancestor passes the value down and a setter back up",
      "lifting too far causes unnecessary re-renders across the subtree",
    ],
    myths: [
      "state must always live in the root component of the application",
      "sibling components can read each other's state directly",
    ],
  },
  {
    term: "conditional rendering",
    tags: ["rendering", "basics"],
    definition:
      "the technique of choosing what a component returns based on the current props or state",
    facts: [
      "returning null renders nothing for that component",
      "false, null and undefined are skipped when rendering children",
      "a ternary inside JSX is the common way to pick between two branches",
    ],
    myths: [
      "returning null from a component throws a render error",
      "the number zero is skipped when rendered as a child",
    ],
  },
  {
    term: "an error boundary",
    tags: ["errors", "resilience"],
    definition:
      "a component that catches render-time errors in its subtree and shows a fallback instead of crashing",
    facts: [
      "it catches errors thrown during rendering and in lifecycle methods below it",
      "an uncaught render error unmounts the whole React tree",
      "it does not catch errors thrown inside event handlers",
    ],
    myths: [
      "an error boundary catches asynchronous errors from event handlers",
      "an error boundary can catch errors thrown inside itself",
    ],
  },
  {
    term: "the useReducer hook",
    tags: ["hooks", "state"],
    definition:
      "a hook that manages state through a reducer function which maps the current state and an action to the next state",
    facts: [
      "it suits state whose next value depends on the previous one in several ways",
      "the reducer must be pure and return a new state object",
      "dispatch keeps a stable identity across renders",
    ],
    myths: [
      "the reducer is allowed to perform side effects such as network calls",
      "useReducer requires an external state management library",
    ],
  },
  {
    term: "the dependency array",
    tags: ["hooks", "correctness"],
    definition:
      "the list of values a hook compares between renders to decide whether to re-run or recompute",
    facts: [
      "values are compared with reference equality",
      "a missing dependency causes the effect to read stale values",
      "an object recreated each render makes the dependency change every time",
    ],
    myths: [
      "the dependency array is compared using a deep equality check",
      "leaving a value out of the array is safe as long as it rarely changes",
    ],
  },
  {
    term: "a custom hook",
    tags: ["hooks", "reuse"],
    definition:
      "a function starting with use that composes built-in hooks to share stateful logic between components",
    facts: [
      "each component calling the hook gets its own independent state",
      "the naming convention lets the linter apply the rules of hooks",
      "it shares logic rather than sharing the state itself",
    ],
    myths: [
      "two components calling the same custom hook share one state value",
      "a custom hook must return JSX",
    ],
  },
  {
    term: "reconciliation",
    tags: ["rendering", "internals"],
    definition:
      "the algorithm that compares two element trees and decides which components to update, mount or unmount",
    facts: [
      "a change of element type at a position unmounts the old subtree entirely",
      "keys tell the algorithm which children correspond across renders",
      "an unmounted component loses all of its local state",
    ],
    myths: [
      "React preserves component state when the element type at a position changes",
      "reconciliation compares the real DOM nodes rather than the element trees",
    ],
  },
];
