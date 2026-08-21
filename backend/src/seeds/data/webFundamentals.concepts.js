export const webFundamentalConcepts = [
  {
    term: "semantic HTML",
    tags: ["html", "accessibility"],
    definition:
      "the use of elements whose names describe the meaning of their content rather than its appearance",
    facts: [
      "screen readers use element roles to let users navigate a page",
      "landmark elements such as nav and main expose page structure",
      "a heading hierarchy should descend without skipping levels",
    ],
    myths: [
      "a div with a click handler is equivalent to a button for accessibility",
      "semantic elements are only about search engine ranking",
    ],
  },
  {
    term: "the CSS box model",
    tags: ["css", "layout"],
    definition:
      "the description of an element as content surrounded by padding, then border, then margin",
    facts: [
      "border-box sizing makes the declared width include padding and border",
      "adjacent vertical margins between block elements collapse into one",
      "margin sits outside the border and is never painted with the background",
    ],
    myths: [
      "padding is drawn outside the element's border",
      "horizontal margins between inline-block elements collapse",
    ],
  },
  {
    term: "CSS flexbox",
    tags: ["css", "layout"],
    definition:
      "a one-dimensional layout model that distributes space between items along a single axis",
    facts: [
      "justify-content aligns items along the main axis",
      "align-items aligns items along the cross axis",
      "flex-direction decides which axis is the main one",
    ],
    myths: [
      "flexbox is designed for two-dimensional grid layouts",
      "justify-content always controls horizontal alignment",
    ],
  },
  {
    term: "CSS grid",
    tags: ["css", "layout"],
    definition:
      "a two-dimensional layout model that positions items into explicit rows and columns",
    facts: [
      "the fr unit distributes the remaining free space in a track",
      "named grid areas make complex placements readable",
      "items can be placed to overlap in the same cell deliberately",
    ],
    myths: [
      "grid can only lay out items in one direction at a time",
      "grid replaces flexbox for every layout problem",
    ],
  },
  {
    term: "CSS specificity",
    tags: ["css", "cascade"],
    definition:
      "the weighting that decides which rule wins when several declarations target the same element",
    facts: [
      "an id selector outweighs any number of class selectors",
      "inline styles outrank selectors in a stylesheet",
      "when specificity ties, the later rule in source order wins",
    ],
    myths: [
      "the rule written last always wins regardless of its selector",
      "the important flag is part of the specificity calculation",
    ],
  },
  {
    term: "CSS position values",
    tags: ["css", "layout"],
    definition:
      "the property deciding whether an element follows normal flow or is offset relative to a containing block",
    facts: [
      "an absolutely positioned element is placed against its nearest positioned ancestor",
      "a fixed element is placed against the viewport and does not scroll away",
      "a sticky element switches to fixed behaviour once it reaches its threshold",
    ],
    myths: [
      "an absolutely positioned element is always placed relative to the page body",
      "a relatively positioned element is removed from the normal flow",
    ],
  },
  {
    term: "the DOM",
    tags: ["dom", "browser"],
    definition:
      "the live tree of objects the browser builds from a document and exposes to scripts",
    facts: [
      "changing the tree updates what the browser paints",
      "querySelector returns the first matching element or null",
      "reading a computed layout value can force a synchronous reflow",
    ],
    myths: [
      "the DOM is the HTML source text held in memory",
      "editing the DOM updates the original HTML file",
    ],
  },
  {
    term: "event bubbling",
    tags: ["dom", "events"],
    definition:
      "the phase where an event travels from the target upwards through each of its ancestors",
    facts: [
      "capturing runs from the root down before the target is reached",
      "stopPropagation halts the event's travel through the remaining ancestors",
      "preventDefault cancels the browser's default action without stopping propagation",
    ],
    myths: [
      "preventDefault stops the event from reaching ancestor handlers",
      "every event type bubbles",
    ],
  },
  {
    term: "the critical rendering path",
    tags: ["performance", "browser"],
    definition:
      "the sequence of steps from receiving markup to painting the first pixels on screen",
    facts: [
      "a synchronous script in the head blocks parsing until it is fetched and run",
      "stylesheets block rendering because the browser needs them to build the render tree",
      "defer lets a script download in parallel and run after parsing completes",
    ],
    myths: [
      "the async attribute guarantees scripts run in document order",
      "images block the first paint of the page",
    ],
  },
  {
    term: "a media query",
    tags: ["css", "responsive"],
    definition:
      "a conditional block that applies styles only when the device or viewport matches its condition",
    facts: [
      "a mobile-first stylesheet uses min-width queries to add complexity upwards",
      "queries can test orientation, resolution and colour scheme",
      "the viewport meta tag is required for queries to reflect real device width",
    ],
    myths: [
      "media queries detect the specific browser or device model",
      "a media query alone makes a layout responsive without fluid sizing",
    ],
  },
  {
    term: "localStorage",
    tags: ["browser", "storage"],
    definition:
      "a per-origin key and value store that persists across sessions and holds only strings",
    facts: [
      "values survive a browser restart until they are cleared",
      "the API is synchronous and blocks the main thread",
      "sessionStorage clears itself when the tab is closed",
    ],
    myths: [
      "localStorage is sent to the server with each request like a cookie",
      "localStorage can store objects without serialisation",
    ],
  },
  {
    term: "cross-site scripting",
    tags: ["security", "web"],
    definition:
      "a flaw where attacker-controlled input is rendered as executable script in another user's browser",
    facts: [
      "escaping output for its context is the primary defence",
      "a content security policy limits which scripts the browser will execute",
      "stored variants persist in the database and affect every viewer",
    ],
    myths: [
      "using HTTPS prevents cross-site scripting",
      "input validation alone removes the need to escape output",
    ],
  },
  {
    term: "cross-site request forgery",
    tags: ["security", "web"],
    definition:
      "an attack where a user's browser is tricked into sending an authenticated request they did not intend",
    facts: [
      "the SameSite cookie attribute blocks the common cross-site cases",
      "an anti-forgery token proves the request came from your own page",
      "it exploits the browser attaching cookies automatically",
    ],
    myths: [
      "checking the referrer header alone is a complete defence",
      "an API using bearer tokens in a header is still exposed to it",
    ],
  },
  {
    term: "the REST architectural style",
    tags: ["api", "architecture"],
    definition:
      "a style where resources are addressed by URL and manipulated with the standard HTTP methods",
    facts: [
      "each request carries everything the server needs to process it",
      "the method conveys the intent rather than the URL path",
      "a resource can be represented in more than one format",
    ],
    myths: [
      "any API returning JSON over HTTP is automatically RESTful",
      "REST requires the server to keep a session for each client",
    ],
  },
  {
    term: "a service worker",
    tags: ["browser", "offline"],
    definition:
      "a background script that intercepts network requests for its scope and can serve cached responses",
    facts: [
      "it runs separately from the page and has no DOM access",
      "it enables offline behaviour by answering requests from a cache",
      "it requires a secure context apart from localhost",
    ],
    myths: [
      "a service worker can manipulate the page DOM directly",
      "a service worker starts controlling pages the moment it is registered",
    ],
  },
  {
    term: "the viewport meta tag",
    tags: ["responsive", "html"],
    definition:
      "the tag telling a mobile browser to lay the page out at device width instead of a wide default",
    facts: [
      "without it a mobile browser renders at a wide virtual width and scales down",
      "it is required for min-width media queries to behave as intended",
      "disabling user scaling harms accessibility",
    ],
    myths: [
      "media queries work correctly on mobile without the tag",
      "the tag itself makes the layout responsive",
    ],
  },
  {
    term: "web accessibility",
    tags: ["accessibility", "standards"],
    definition:
      "the practice of building pages that people using assistive technology can perceive and operate",
    facts: [
      "every interactive control must be reachable and usable with a keyboard",
      "text and background need sufficient contrast to stay readable",
      "images that convey meaning need descriptive alternative text",
    ],
    myths: [
      "adding ARIA attributes to a div makes it as accessible as a native control",
      "accessibility only matters for users who cannot see",
    ],
  },
  {
    term: "the CSS cascade layers",
    tags: ["css", "cascade"],
    definition:
      "the ordering mechanism that groups rules so whole layers can be prioritised independently of specificity",
    facts: [
      "a later layer beats an earlier one regardless of selector specificity",
      "unlayered styles take precedence over layered ones by default",
      "layers give a predictable way to slot in a third-party stylesheet",
    ],
    myths: [
      "specificity still decides the winner across two different layers",
      "cascade layers replace the need for the cascade itself",
    ],
  },
  {
    term: "a data attribute",
    tags: ["html", "dom"],
    definition:
      "a custom attribute prefixed with data- that stores page-specific values on an element",
    facts: [
      "the dataset property exposes these attributes to scripts",
      "the name is converted from dashes to camel case in the dataset",
      "it keeps custom values out of non-standard attributes",
    ],
    myths: [
      "data attributes are hidden from the rendered HTML source",
      "CSS cannot select on a data attribute's value",
    ],
  },
  {
    term: "debouncing a browser event",
    tags: ["performance", "events"],
    definition:
      "the practice of limiting how often a handler runs for rapidly firing events such as scroll or resize",
    facts: [
      "scroll and resize can fire many times per second",
      "requestAnimationFrame aligns visual work with the next paint",
      "an unthrottled layout read inside such a handler causes jank",
    ],
    myths: [
      "the browser throttles scroll handlers automatically for you",
      "throttling and debouncing produce the same call pattern",
    ],
  },
];
