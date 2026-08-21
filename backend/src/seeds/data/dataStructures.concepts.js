export const dataStructureConcepts = [
  {
    term: "an array",
    tags: ["structures", "basics"],
    definition:
      "a contiguous block of memory whose elements are reached in constant time from an index",
    facts: [
      "reading by index costs constant time",
      "inserting at the front shifts every following element",
      "contiguous storage gives arrays very good cache locality",
    ],
    myths: [
      "inserting at the beginning of an array costs constant time",
      "searching an unsorted array can be done in logarithmic time",
    ],
  },
  {
    term: "a linked list",
    tags: ["structures", "pointers"],
    definition:
      "a chain of nodes where each node stores a value and a reference to the next node",
    facts: [
      "inserting after a known node costs constant time",
      "reaching the nth element requires walking n links",
      "nodes are scattered in memory, which hurts cache performance",
    ],
    myths: [
      "a linked list supports constant-time access by index",
      "a singly linked list can be traversed backwards without extra pointers",
    ],
  },
  {
    term: "a stack",
    tags: ["structures", "basics"],
    definition:
      "a collection where the most recently added element is the first one removed",
    facts: [
      "push and pop both cost constant time",
      "the call stack is the classic example of this discipline",
      "depth-first traversal is naturally expressed with a stack",
    ],
    myths: [
      "a stack removes the element that was inserted earliest",
      "a stack allows constant-time access to an arbitrary element",
    ],
  },
  {
    term: "a queue",
    tags: ["structures", "basics"],
    definition:
      "a collection where the earliest added element is the first one removed",
    facts: [
      "enqueue and dequeue both cost constant time with the right implementation",
      "breadth-first traversal is naturally expressed with a queue",
      "a deque allows insertion and removal at both ends",
    ],
    myths: [
      "a queue removes the most recently inserted element",
      "a priority queue serves its elements in arrival order",
    ],
  },
  {
    term: "a hash table",
    tags: ["structures", "hashing"],
    definition:
      "a structure that maps a key to a bucket through a hash function to give average constant-time lookup",
    facts: [
      "lookup costs constant time on average but linear time in the worst case",
      "collisions are resolved by chaining or by open addressing",
      "a high load factor triggers a resize and a rehash of every key",
    ],
    myths: [
      "a hash table preserves the insertion order of its keys",
      "a good hash function makes collisions impossible",
    ],
  },
  {
    term: "a binary search tree",
    tags: ["trees", "structures"],
    definition:
      "a tree where every left descendant is smaller than its node and every right descendant is larger",
    facts: [
      "an in-order traversal visits the keys in sorted order",
      "search costs time proportional to the height of the tree",
      "inserting already sorted data degenerates the tree into a list",
    ],
    myths: [
      "a binary search tree guarantees logarithmic operations without balancing",
      "a level-order traversal of the tree yields the keys in sorted order",
    ],
  },
  {
    term: "a balanced tree",
    tags: ["trees", "structures"],
    definition:
      "a search tree that restructures itself on update so its height stays proportional to the logarithm of its size",
    facts: [
      "rotations restore the balance invariant after an insert or delete",
      "the guaranteed height keeps search logarithmic in the worst case",
      "red-black trees and AVL trees are two common balancing schemes",
    ],
    myths: [
      "balancing makes each individual insert cheaper than in an unbalanced tree",
      "a balanced tree stores its keys in a contiguous array",
    ],
  },
  {
    term: "a binary heap",
    tags: ["heaps", "structures"],
    definition:
      "a complete binary tree where every parent compares favourably to its children, stored inside an array",
    facts: [
      "the minimum or maximum is available at the root in constant time",
      "insert and extract both cost logarithmic time",
      "building a heap from an existing array costs linear time",
    ],
    myths: [
      "a heap keeps all of its elements in fully sorted order",
      "finding an arbitrary value in a heap takes logarithmic time",
    ],
  },
  {
    term: "a graph",
    tags: ["graphs", "structures"],
    definition:
      "a set of vertices together with edges that connect pairs of them, optionally directed or weighted",
    facts: [
      "an adjacency list suits sparse graphs and an adjacency matrix suits dense ones",
      "a cycle is a path that returns to its starting vertex",
      "a tree is a connected graph with no cycles",
    ],
    myths: [
      "every graph can be traversed from any vertex to every other vertex",
      "an adjacency matrix is the memory-efficient choice for a sparse graph",
    ],
  },
  {
    term: "a trie",
    tags: ["strings", "structures"],
    definition:
      "a tree keyed by the characters of a string so shared prefixes share the same path from the root",
    facts: [
      "lookup cost depends on the key length rather than the number of stored keys",
      "it makes prefix queries and autocomplete efficient",
      "it can use far more memory than a hash table for the same key set",
    ],
    myths: [
      "a trie is always more memory efficient than a hash table",
      "a trie cannot answer prefix queries without scanning every key",
    ],
  },
  {
    term: "big O notation",
    tags: ["complexity", "analysis"],
    definition:
      "a description of how a cost grows with input size, ignoring constants and lower-order terms",
    facts: [
      "it describes growth rate rather than actual running time",
      "an algorithm with a worse growth rate can still win on small inputs",
      "space complexity is analysed with the same notation as time",
    ],
    myths: [
      "big O tells you exactly how many milliseconds an operation takes",
      "a constant-time operation is always faster than a logarithmic one in practice",
    ],
  },
  {
    term: "binary search",
    tags: ["algorithms", "searching"],
    definition:
      "an algorithm that halves the remaining search interval at each step over a sorted sequence",
    facts: [
      "it requires the input to be sorted beforehand",
      "it costs logarithmic time in the size of the sequence",
      "computing the midpoint carelessly can overflow in fixed-width integer languages",
    ],
    myths: [
      "binary search works correctly on unsorted input",
      "binary search on a linked list is still logarithmic",
    ],
    code: {
      title: "Implement binarySearch(sortedArray, target) returning the index or -1.",
      language: "javascript",
      starterCode: "function binarySearch(sortedArray, target) {\n  // return the index or -1\n}\n",
      explanation: "keep the loop invariant clear so the bounds always shrink and the loop terminates",
      testCases: [
        { input: "[1,3,5,7,9], target 7", expectedOutput: "3", isHidden: false },
        { input: "[1,3,5,7,9], target 4", expectedOutput: "-1", isHidden: false },
        { input: "[], target 1", expectedOutput: "-1", isHidden: true },
      ],
    },
  },
  {
    term: "merge sort",
    tags: ["algorithms", "sorting"],
    definition:
      "a divide-and-conquer sort that splits the input, sorts each half and merges the sorted halves",
    facts: [
      "it runs in linearithmic time in the best, average and worst case",
      "it is stable, so equal elements keep their original order",
      "the standard array implementation needs extra space proportional to the input",
    ],
    myths: [
      "merge sort sorts in place with constant extra space",
      "merge sort degrades to quadratic time on adversarial input",
    ],
  },
  {
    term: "quicksort",
    tags: ["algorithms", "sorting"],
    definition:
      "a divide-and-conquer sort that partitions around a pivot and recurses into each side",
    facts: [
      "its average case is linearithmic and its worst case is quadratic",
      "a poor pivot choice on already sorted input causes the worst case",
      "randomised or median-of-three pivots make the worst case unlikely",
    ],
    myths: [
      "quicksort is stable by default",
      "quicksort guarantees linearithmic time in every case",
    ],
  },
  {
    term: "breadth-first search",
    tags: ["graphs", "algorithms"],
    definition:
      "a traversal that visits every vertex at the current distance before moving one step further out",
    facts: [
      "it finds the shortest path in an unweighted graph",
      "it uses a queue to hold the frontier",
      "visited vertices must be marked or a cyclic graph loops forever",
    ],
    myths: [
      "breadth-first search finds the cheapest path in a weighted graph",
      "breadth-first search uses a stack for its frontier",
    ],
  },
  {
    term: "depth-first search",
    tags: ["graphs", "algorithms"],
    definition:
      "a traversal that follows one branch as far as it goes before backtracking to the next option",
    facts: [
      "it can be written recursively or with an explicit stack",
      "it underpins cycle detection and topological sorting",
      "its recursion depth can overflow the call stack on a deep graph",
    ],
    myths: [
      "depth-first search visits vertices in order of increasing distance",
      "depth-first search always finds the shortest path between two vertices",
    ],
  },
  {
    term: "dynamic programming",
    tags: ["algorithms", "optimisation"],
    definition:
      "a technique that solves overlapping subproblems once and reuses the stored results",
    facts: [
      "it requires optimal substructure and overlapping subproblems",
      "memoisation is the top-down form and tabulation the bottom-up form",
      "it trades additional memory for a lower time complexity",
    ],
    myths: [
      "dynamic programming applies to any problem that can be written recursively",
      "memoisation and tabulation always use the same amount of memory",
    ],
  },
  {
    term: "a greedy algorithm",
    tags: ["algorithms", "optimisation"],
    definition:
      "an approach that takes the locally best option at each step and never reconsiders it",
    facts: [
      "it needs a proof of correctness for the specific problem",
      "it is usually faster and simpler than a dynamic programming solution",
      "it solves the fractional knapsack problem optimally",
    ],
    myths: [
      "a greedy choice always produces the globally optimal answer",
      "greedy algorithms solve the 0/1 knapsack problem optimally",
    ],
  },
  {
    term: "recursion",
    tags: ["algorithms", "basics"],
    definition:
      "a technique where a function solves a problem by calling itself on a smaller instance",
    facts: [
      "a base case is required or the recursion never terminates",
      "each pending call consumes a frame on the call stack",
      "any recursive solution can be rewritten iteratively with an explicit stack",
    ],
    myths: [
      "recursion always uses less memory than the equivalent loop",
      "every JavaScript engine optimises tail calls into loops",
    ],
  },
  {
    term: "amortised analysis",
    tags: ["complexity", "analysis"],
    definition:
      "a way of averaging the cost of an operation over a long sequence rather than looking at the worst single call",
    facts: [
      "appending to a dynamic array is amortised constant time",
      "an occasional expensive resize is paid for by many cheap operations",
      "it differs from average-case analysis, which averages over inputs",
    ],
    myths: [
      "amortised constant time means every individual call is constant time",
      "amortised analysis and average-case analysis mean the same thing",
    ],
  },
];
