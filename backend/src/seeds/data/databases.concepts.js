export const databaseConcepts = [
  {
    term: "a primary key",
    tags: ["schema", "keys"],
    definition:
      "the column or set of columns that uniquely identifies every row in a table and can never be null",
    facts: [
      "a table can have at most one primary key",
      "most engines create a unique index for the primary key automatically",
      "a composite primary key is made of more than one column together",
    ],
    myths: [
      "a primary key column is allowed to contain null for unknown rows",
      "a table may declare several primary keys as long as each is unique",
    ],
  },
  {
    term: "a foreign key",
    tags: ["schema", "keys", "integrity"],
    definition:
      "a constraint that forces a column's values to match an existing key in another table",
    facts: [
      "a foreign key blocks inserts that reference a row which does not exist",
      "on delete cascade removes the dependent rows along with the parent",
      "a foreign key must point at a unique or primary key column",
    ],
    myths: [
      "a foreign key column is automatically indexed by every engine",
      "a foreign key can reference any column regardless of its constraints",
    ],
  },
  {
    term: "database normalisation",
    tags: ["schema", "design"],
    definition:
      "the process of splitting data across tables so each fact is stored in exactly one place",
    facts: [
      "normalisation removes update anomalies caused by duplicated data",
      "third normal form requires every non-key column to depend only on the key",
      "a highly normalised schema usually needs more joins to answer a query",
    ],
    myths: [
      "normalisation always makes read queries faster",
      "denormalisation is always a design mistake",
    ],
  },
  {
    term: "a database index",
    tags: ["performance", "indexes"],
    definition:
      "an auxiliary structure that lets the engine locate matching rows without reading the whole table",
    facts: [
      "an index speeds up reads but adds cost to every insert, update and delete",
      "a compound index can only be used left to right across its columns",
      "a covering index answers a query from the index alone without touching the rows",
    ],
    myths: [
      "adding an index to every column is the safest way to tune a database",
      "an index makes writes faster as well as reads",
    ],
  },
  {
    term: "an ACID transaction",
    tags: ["transactions", "reliability"],
    definition:
      "a unit of work that is atomic, consistent, isolated and durable, so it either fully applies or leaves no trace",
    facts: [
      "atomicity means a failed transaction rolls back every change it made",
      "durability means a committed transaction survives a crash",
      "isolation controls what one transaction sees of another's uncommitted work",
    ],
    myths: [
      "isolation means transactions can never run at the same time",
      "a committed transaction can still be silently discarded under load",
    ],
  },
  {
    term: "an inner join",
    tags: ["sql", "joins"],
    definition:
      "a join that returns only the row pairs which satisfy the join condition on both sides",
    facts: [
      "rows without a match on either side are dropped from the result",
      "an inner join is commutative, so the table order does not change the rows returned",
      "a left join differs by keeping every row from the left table",
    ],
    myths: [
      "an inner join keeps unmatched rows and fills them with null",
      "an inner join always returns at least as many rows as the smaller table",
    ],
  },
  {
    term: "a left outer join",
    tags: ["sql", "joins"],
    definition:
      "a join that keeps every row from the left table and fills the right side with null when there is no match",
    facts: [
      "unmatched right-hand columns come back as null",
      "moving a right-table filter from the where clause to the on clause changes the result",
      "it is the usual way to find rows that have no related record",
    ],
    myths: [
      "a left join and an inner join return the same rows when both tables are populated",
      "a where clause on a right-table column preserves the unmatched left rows",
    ],
  },
  {
    term: "a group by clause",
    tags: ["sql", "aggregation"],
    definition:
      "a clause that collapses rows sharing the same key values into one row per group for aggregation",
    facts: [
      "every selected column must be aggregated or listed in the group by",
      "having filters groups after aggregation while where filters rows before it",
      "count with an expression ignores rows where that expression is null",
    ],
    myths: [
      "where can filter on the result of an aggregate function",
      "group by sorts the result set in a guaranteed order",
    ],
  },
  {
    term: "a collection scan",
    tags: ["performance", "mongodb"],
    definition:
      "a query plan that reads every document in a collection because no usable index exists",
    facts: [
      "a collection scan gets slower in proportion to the data volume",
      "explain reports the winning plan so you can see whether a scan was chosen",
      "an index scan visits only the entries matching the predicate",
    ],
    myths: [
      "a collection scan is faster than an index scan on large collections",
      "MongoDB refuses to run a query when no index matches it",
    ],
  },
  {
    term: "the MongoDB aggregation pipeline",
    tags: ["mongodb", "aggregation"],
    definition:
      "an ordered sequence of stages where each stage transforms the documents it receives from the previous one",
    facts: [
      "placing match early reduces the documents every later stage has to process",
      "lookup performs a left outer join against another collection",
      "stage order changes both the result and the performance of a pipeline",
    ],
    myths: [
      "the pipeline reorders stages automatically for optimal performance in every case",
      "a lookup stage can only join on the id field",
    ],
  },
  {
    term: "schema flexibility in MongoDB",
    tags: ["mongodb", "schema"],
    definition:
      "the property that documents in one collection may hold different fields unless validation is configured",
    facts: [
      "a collection accepts documents with different shapes by default",
      "JSON schema validation rules can be attached to a collection explicitly",
      "an application-level schema such as a Mongoose model enforces shape in code",
    ],
    myths: [
      "MongoDB enforces a fixed column structure on every collection",
      "a missing field is stored as an explicit null in every document",
    ],
  },
  {
    term: "database sharding",
    tags: ["scaling", "distribution"],
    definition:
      "the practice of splitting one dataset horizontally across servers so each holds a subset of the rows",
    facts: [
      "the shard key decides which server owns a given record",
      "a poorly chosen shard key concentrates traffic on a single shard",
      "queries that omit the shard key must be broadcast to every shard",
    ],
    myths: [
      "sharding and replication solve the same problem",
      "the shard key can be changed freely once data is distributed",
    ],
  },
  {
    term: "database replication",
    tags: ["scaling", "availability"],
    definition:
      "the practice of keeping copies of the same data on multiple servers for redundancy and read capacity",
    facts: [
      "a replica can take over when the primary becomes unavailable",
      "asynchronous replication lets a replica lag behind the primary",
      "reading from a replica can return slightly stale data",
    ],
    myths: [
      "every replica is guaranteed to be byte-identical to the primary at all times",
      "replication increases the total amount of data the cluster can store",
    ],
  },
  {
    term: "the N plus one query problem",
    tags: ["performance", "orm"],
    definition:
      "a pattern where fetching a list triggers one extra query per row to load its related record",
    facts: [
      "it usually appears when a loop accesses a lazily loaded relation",
      "eager loading or a join collapses the extra queries into one round trip",
      "the cost grows linearly with the number of parent rows returned",
    ],
    myths: [
      "the problem disappears once the database has the right indexes",
      "it only affects relational databases and never document stores",
    ],
  },
  {
    term: "a deadlock",
    tags: ["transactions", "concurrency"],
    definition:
      "a standstill where two transactions each hold a lock the other needs and neither can continue",
    facts: [
      "the engine detects the cycle and aborts one transaction as the victim",
      "acquiring locks in a consistent order across the code prevents most deadlocks",
      "shorter transactions reduce the window in which a deadlock can form",
    ],
    myths: [
      "a deadlock resolves itself once the lock timeout is raised high enough",
      "read-only transactions can never take part in a deadlock",
    ],
  },
  {
    term: "an SQL injection vulnerability",
    tags: ["security", "sql"],
    definition:
      "a flaw where untrusted input is concatenated into a query and changes the statement's meaning",
    facts: [
      "parameterised queries send values separately from the statement text",
      "the flaw can expose or destroy data far beyond the intended query",
      "escaping by hand is error prone compared with using bound parameters",
    ],
    myths: [
      "using an ORM makes injection impossible regardless of how queries are written",
      "input validation on the client is enough to prevent injection",
    ],
  },
  {
    term: "a database view",
    tags: ["sql", "schema"],
    definition:
      "a named query that behaves like a table and is evaluated each time it is referenced",
    facts: [
      "a view stores the query definition rather than the rows",
      "a materialised view does store results and must be refreshed",
      "views can restrict which columns a role is allowed to read",
    ],
    myths: [
      "a plain view caches its rows and so is always faster than the query it wraps",
      "every view can be updated directly with an insert or update statement",
    ],
  },
  {
    term: "the CAP theorem",
    tags: ["distributed", "theory"],
    definition:
      "the result that a distributed store facing a network partition must give up either consistency or availability",
    facts: [
      "the trade-off only forces a choice while a partition is actually happening",
      "a CP system rejects requests rather than returning stale data",
      "an AP system keeps serving requests and reconciles differences later",
    ],
    myths: [
      "a system must permanently sacrifice one of the three properties",
      "the theorem says a database can never be both consistent and available",
    ],
  },
  {
    term: "connection pooling",
    tags: ["performance", "infrastructure"],
    definition:
      "the reuse of a fixed set of open database connections instead of opening a new one per request",
    facts: [
      "opening a connection is expensive compared with reusing an idle one",
      "an undersized pool makes requests queue while waiting for a free connection",
      "the pool size should account for the database's own connection limit",
    ],
    myths: [
      "a larger pool always increases throughput",
      "each application request needs its own dedicated permanent connection",
    ],
  },
  {
    term: "an isolation level",
    tags: ["transactions", "concurrency"],
    definition:
      "a setting that decides which concurrency anomalies a transaction may observe from other transactions",
    facts: [
      "read committed prevents dirty reads but still allows non-repeatable reads",
      "serialisable is the strictest level and behaves as if transactions ran one at a time",
      "stricter isolation generally costs throughput under contention",
    ],
    myths: [
      "the highest isolation level has no effect on performance",
      "read uncommitted still guarantees you never see another transaction's rollback",
    ],
  },
];
