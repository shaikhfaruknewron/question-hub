import { javascriptConcepts } from "./javascript.concepts.js";
import { databaseConcepts } from "./databases.concepts.js";
import { reactConcepts } from "./react.concepts.js";
import { nodejsConcepts } from "./nodejs.concepts.js";
import { dataStructureConcepts } from "./dataStructures.concepts.js";
import { networkingConcepts } from "./networking.concepts.js";
import { operatingSystemConcepts } from "./operatingSystems.concepts.js";
import { pythonConcepts } from "./python.concepts.js";
import { webFundamentalConcepts } from "./webFundamentals.concepts.js";
import { gitConcepts } from "./git.concepts.js";

export const CONCEPT_BANKS = [
  {
    name: "JavaScript",
    tag: "javascript",
    description: "Core language semantics, asynchrony and the module system",
    concepts: javascriptConcepts,
  },
  {
    name: "Databases",
    tag: "databases",
    description: "Relational and document modelling, indexing, transactions and scaling",
    concepts: databaseConcepts,
  },
  {
    name: "React",
    tag: "react",
    description: "Components, hooks, rendering behaviour and reconciliation",
    concepts: reactConcepts,
  },
  {
    name: "Node.js",
    tag: "nodejs",
    description: "Runtime internals, Express, authentication and production concerns",
    concepts: nodejsConcepts,
  },
  {
    name: "Data Structures and Algorithms",
    tag: "dsa",
    description: "Core structures, traversal, sorting and complexity analysis",
    concepts: dataStructureConcepts,
  },
  {
    name: "Computer Networks",
    tag: "networking",
    description: "Transport protocols, HTTP, DNS, TLS and delivery infrastructure",
    concepts: networkingConcepts,
  },
  {
    name: "Operating Systems",
    tag: "operating-systems",
    description: "Processes, threads, scheduling, memory management and synchronisation",
    concepts: operatingSystemConcepts,
  },
  {
    name: "Python",
    tag: "python",
    description: "Collections, functions, typing, concurrency and common pitfalls",
    concepts: pythonConcepts,
  },
  {
    name: "Web Fundamentals",
    tag: "web-fundamentals",
    description: "HTML semantics, CSS layout, the DOM, browser performance and web security",
    concepts: webFundamentalConcepts,
  },
  {
    name: "Git and Version Control",
    tag: "git",
    description: "Commits, branching, merging, rewriting history and collaboration",
    concepts: gitConcepts,
  },
];
