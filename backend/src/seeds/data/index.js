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
import { QUESTION_TOPICS } from "../../constants/question.constants.js";

export const CONCEPT_BANKS = [
  {
    name: "JavaScript",
    topic: QUESTION_TOPICS.JAVASCRIPT,
    description: "Core language semantics, asynchrony and the module system",
    concepts: javascriptConcepts,
  },
  {
    name: "Databases",
    topic: QUESTION_TOPICS.DATABASES,
    description: "Relational and document modelling, indexing, transactions and scaling",
    concepts: databaseConcepts,
  },
  {
    name: "React",
    topic: QUESTION_TOPICS.REACT,
    description: "Components, hooks, rendering behaviour and reconciliation",
    concepts: reactConcepts,
  },
  {
    name: "Node.js",
    topic: QUESTION_TOPICS.NODEJS,
    description: "Runtime internals, Express, authentication and production concerns",
    concepts: nodejsConcepts,
  },
  {
    name: "Data Structures and Algorithms",
    topic: QUESTION_TOPICS.DSA,
    description: "Core structures, traversal, sorting and complexity analysis",
    concepts: dataStructureConcepts,
  },
  {
    name: "Computer Networks",
    topic: QUESTION_TOPICS.NETWORKING,
    description: "Transport protocols, HTTP, DNS, TLS and delivery infrastructure",
    concepts: networkingConcepts,
  },
  {
    name: "Operating Systems",
    topic: QUESTION_TOPICS.OPERATING_SYSTEMS,
    description: "Processes, threads, scheduling, memory management and synchronisation",
    concepts: operatingSystemConcepts,
  },
  {
    name: "Python",
    topic: QUESTION_TOPICS.PYTHON,
    description: "Collections, functions, typing, concurrency and common pitfalls",
    concepts: pythonConcepts,
  },
  {
    name: "Web Fundamentals",
    topic: QUESTION_TOPICS.WEB_FUNDAMENTALS,
    description: "HTML semantics, CSS layout, the DOM, browser performance and web security",
    concepts: webFundamentalConcepts,
  },
  {
    name: "Git and Version Control",
    topic: QUESTION_TOPICS.GIT,
    description: "Commits, branching, merging, rewriting history and collaboration",
    concepts: gitConcepts,
  },
];
