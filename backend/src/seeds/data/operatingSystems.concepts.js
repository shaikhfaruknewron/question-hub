export const operatingSystemConcepts = [
  {
    term: "a process",
    tags: ["processes", "basics"],
    definition:
      "a running program together with its own isolated address space and system resources",
    facts: [
      "one process cannot read another's memory without explicit sharing",
      "creating a process is heavier than creating a thread",
      "processes communicate through pipes, sockets or shared memory segments",
    ],
    myths: [
      "two processes share their heap by default",
      "killing a parent process always terminates its children",
    ],
  },
  {
    term: "a thread",
    tags: ["threads", "concurrency"],
    definition:
      "an independently schedulable path of execution that shares its process's address space",
    facts: [
      "threads in one process share the heap but each has its own stack",
      "sharing memory is what makes synchronisation necessary",
      "a thread is cheaper to create and switch than a process",
    ],
    myths: [
      "each thread gets its own private copy of the heap",
      "using threads removes the possibility of race conditions",
    ],
  },
  {
    term: "a context switch",
    tags: ["scheduling", "performance"],
    definition:
      "the act of saving one execution context and restoring another so a different task can run",
    facts: [
      "the saved state includes registers and the program counter",
      "switching invalidates cache lines and translation entries, which costs time",
      "a process switch is more expensive than a thread switch in the same process",
    ],
    myths: [
      "a context switch is free because it happens in hardware",
      "more threads always mean more useful work per second",
    ],
  },
  {
    term: "virtual memory",
    tags: ["memory", "abstraction"],
    definition:
      "an abstraction giving each process a private address space that the hardware maps onto physical frames",
    facts: [
      "the memory management unit translates virtual addresses to physical ones",
      "a page fault brings a missing page in from backing storage",
      "processes can address more memory than is physically installed",
    ],
    myths: [
      "virtual addresses map directly to physical addresses",
      "every page of a running process is resident in RAM",
    ],
  },
  {
    term: "paging",
    tags: ["memory", "management"],
    definition:
      "the division of memory into fixed-size pages so allocation avoids external fragmentation",
    facts: [
      "a page table records where each virtual page lives",
      "the translation lookaside buffer caches recent translations",
      "fixed-size pages cause internal fragmentation in the final page",
    ],
    myths: [
      "paging eliminates every form of memory fragmentation",
      "page size is chosen per process at run time",
    ],
  },
  {
    term: "thrashing",
    tags: ["memory", "performance"],
    definition:
      "a state where the system spends more time moving pages between disk and memory than running the work",
    facts: [
      "it happens when the active working set exceeds available physical memory",
      "throughput collapses even though the CPU appears busy handling faults",
      "reducing the degree of multiprogramming is one way out",
    ],
    myths: [
      "thrashing is fixed by raising the process scheduling priority",
      "thrashing indicates a shortage of CPU rather than memory",
    ],
  },
  {
    term: "a deadlock",
    tags: ["concurrency", "synchronisation"],
    definition:
      "a state where a set of tasks each hold a resource another needs and none can proceed",
    facts: [
      "all four Coffman conditions must hold simultaneously for one to occur",
      "imposing a global lock ordering breaks the circular wait condition",
      "detection with recovery is an alternative to prevention",
    ],
    myths: [
      "a deadlock resolves itself once the scheduler runs the tasks again",
      "deadlocks can only involve exactly two tasks",
    ],
  },
  {
    term: "a race condition",
    tags: ["concurrency", "correctness"],
    definition:
      "a defect where the result depends on the unpredictable relative timing of concurrent operations",
    facts: [
      "it appears when concurrent tasks touch shared state without synchronisation",
      "it can stay hidden for a long time and then fail under load",
      "protecting the critical section with a lock removes it",
    ],
    myths: [
      "a race condition reproduces reliably on every run",
      "a single-line increment statement is inherently atomic",
    ],
  },
  {
    term: "a mutex",
    tags: ["synchronisation", "concurrency"],
    definition:
      "a lock that lets only one task at a time enter the region it protects",
    facts: [
      "the task that locks a mutex is the one expected to unlock it",
      "holding a lock for a long time serialises the whole system",
      "a semaphore generalises it by permitting a fixed number of holders",
    ],
    myths: [
      "a mutex allows several readers into the critical section at once",
      "taking a mutex guarantees the code inside cannot deadlock",
    ],
  },
  {
    term: "a semaphore",
    tags: ["synchronisation", "concurrency"],
    definition:
      "a counter guarding access so that at most a fixed number of tasks hold the resource at once",
    facts: [
      "a counting semaphore admits a configurable number of holders",
      "a binary semaphore behaves much like a mutex",
      "it is the usual tool for the producer and consumer problem",
    ],
    myths: [
      "a semaphore must always be released by the task that acquired it",
      "a semaphore guarantees the waiting tasks are served in arrival order",
    ],
  },
  {
    term: "CPU scheduling",
    tags: ["scheduling", "kernel"],
    definition:
      "the kernel's decision about which ready task runs next on an available core",
    facts: [
      "a preemptive scheduler can interrupt a running task when its slice expires",
      "round robin gives each ready task a fixed time slice in turn",
      "priority scheduling can starve low-priority tasks without ageing",
    ],
    myths: [
      "shortest job first is practical because job lengths are known in advance",
      "a higher priority guarantees a task runs before any lower-priority one ever does",
    ],
  },
  {
    term: "a system call",
    tags: ["kernel", "interfaces"],
    definition:
      "the controlled entry point through which user code asks the kernel to perform a privileged operation",
    facts: [
      "it switches the processor from user mode to kernel mode",
      "the transition costs far more than an ordinary function call",
      "reading a file or opening a socket goes through one",
    ],
    myths: [
      "a system call is as cheap as a normal function call",
      "user-mode code can execute privileged instructions directly",
    ],
  },
  {
    term: "an interrupt",
    tags: ["kernel", "hardware"],
    definition:
      "a signal that makes the processor suspend its current work and run a handler for an event",
    facts: [
      "the handler should finish quickly and defer longer work",
      "hardware devices use interrupts to avoid being polled",
      "interrupts can be masked temporarily during critical kernel sections",
    ],
    myths: [
      "an interrupt handler can block waiting on a lock with no consequences",
      "interrupts are checked only when a process yields voluntarily",
    ],
  },
  {
    term: "an inode",
    tags: ["filesystem", "storage"],
    definition:
      "the filesystem record holding a file's metadata and the location of its data blocks",
    facts: [
      "the file name lives in the directory entry rather than in the inode",
      "several hard links can point at the same inode",
      "the data is freed once the link count and the open count both reach zero",
    ],
    myths: [
      "the inode stores the file's name",
      "deleting one hard link always frees the file's data",
    ],
  },
  {
    term: "a file descriptor",
    tags: ["filesystem", "processes"],
    definition:
      "the small integer a process uses to refer to an open file, socket or pipe",
    facts: [
      "descriptors 0, 1 and 2 are standard input, output and error",
      "a process has a limited number of descriptors it may hold open",
      "child processes inherit the parent's open descriptors across a fork",
    ],
    myths: [
      "file descriptors are shared globally across all processes",
      "a descriptor number is unique across the whole system",
    ],
  },
  {
    term: "the fork system call",
    tags: ["processes", "kernel"],
    definition:
      "the call that creates a child process as a near copy of the caller",
    facts: [
      "it returns zero in the child and the child's id in the parent",
      "copy-on-write avoids duplicating memory until one side writes",
      "the child inherits the parent's open file descriptors",
    ],
    myths: [
      "fork returns the same value in both the parent and the child",
      "the child shares its memory with the parent for both reads and writes",
    ],
  },
  {
    term: "a zombie process",
    tags: ["processes", "lifecycle"],
    definition:
      "a finished process whose entry stays in the table because its parent has not collected its exit status",
    facts: [
      "it holds a process table entry but uses no memory or CPU",
      "the parent removes it by calling wait",
      "an orphan is re-parented to init, which reaps it automatically",
    ],
    myths: [
      "a zombie process keeps consuming CPU time",
      "sending a kill signal to a zombie removes it",
    ],
  },
  {
    term: "user mode and kernel mode",
    tags: ["kernel", "security"],
    definition:
      "the two privilege levels that separate ordinary application execution from privileged kernel execution",
    facts: [
      "application code runs in the restricted user mode",
      "a fault in user mode kills only that process",
      "the boundary is what makes process isolation enforceable",
    ],
    myths: [
      "an application can enter kernel mode whenever it chooses",
      "a crash in user mode brings down the whole operating system",
    ],
  },
  {
    term: "the page replacement policy",
    tags: ["memory", "algorithms"],
    definition:
      "the rule deciding which resident page is evicted when a new one must be loaded",
    facts: [
      "least recently used approximates the optimal policy in practice",
      "the optimal policy needs future knowledge and is only a benchmark",
      "first in first out can suffer Belady's anomaly",
    ],
    myths: [
      "the optimal replacement policy is implementable in a real kernel",
      "adding more frames always reduces the fault count for every policy",
    ],
  },
  {
    term: "inter-process communication",
    tags: ["processes", "concurrency"],
    definition:
      "the set of mechanisms letting isolated processes exchange data through the kernel",
    facts: [
      "pipes, sockets, message queues and shared memory are common mechanisms",
      "shared memory is the fastest but needs explicit synchronisation",
      "sockets work between machines as well as within one",
    ],
    myths: [
      "processes can exchange data through ordinary global variables",
      "shared memory handles synchronisation on the processes' behalf",
    ],
  },
];
