export const gitConcepts = [
  {
    term: "a Git commit",
    tags: ["basics", "history"],
    definition:
      "an immutable snapshot of the tracked tree together with its parent link, author and message",
    facts: [
      "a commit records the full tree state rather than a patch",
      "its identifier is a hash of its content and metadata",
      "changing anything about a commit produces a different identifier",
    ],
    myths: [
      "a commit stores only the lines that changed",
      "amending a commit keeps its original identifier",
    ],
  },
  {
    term: "the staging area",
    tags: ["basics", "workflow"],
    definition:
      "the intermediate space where changes are collected before they become part of a commit",
    facts: [
      "only staged changes are included in the next commit",
      "add with the patch flag lets you stage selected hunks of a file",
      "a file can have both staged and unstaged changes at once",
    ],
    myths: [
      "committing includes every modified file whether staged or not",
      "staging a file writes the change permanently to history",
    ],
  },
  {
    term: "a Git branch",
    tags: ["branching", "basics"],
    definition:
      "a movable pointer to a commit that advances automatically as new commits are made",
    facts: [
      "creating a branch only writes a small reference file",
      "the pointer moves forward with each new commit on that branch",
      "HEAD indicates which branch is currently checked out",
    ],
    myths: [
      "creating a branch copies the whole working tree",
      "deleting a branch always destroys the commits it pointed at",
    ],
  },
  {
    term: "a merge commit",
    tags: ["merging", "history"],
    definition:
      "a commit with more than one parent that joins two lines of development together",
    facts: [
      "it preserves the true shape of the branching history",
      "a fast-forward happens instead when the target has not diverged",
      "the no-ff flag forces a merge commit even when fast-forward is possible",
    ],
    myths: [
      "every merge produces a merge commit",
      "a merge commit discards the history of the branch being merged",
    ],
  },
  {
    term: "a rebase",
    tags: ["rebasing", "history"],
    definition:
      "the operation that replays a series of commits onto a new base, creating new commits as it goes",
    facts: [
      "the replayed commits get new identifiers",
      "it produces a linear history without merge commits",
      "rebasing shared branches forces collaborators to reconcile rewritten history",
    ],
    myths: [
      "a rebase preserves the original commit identifiers",
      "rebasing a pushed branch is safe for everyone who already pulled it",
    ],
  },
  {
    term: "a merge conflict",
    tags: ["merging", "workflow"],
    definition:
      "a state where two branches changed the same region and Git cannot decide which version to keep",
    facts: [
      "conflict markers are written into the affected files for you to resolve",
      "the merge stays incomplete until the resolved files are staged",
      "abort returns the working tree to its state before the merge began",
    ],
    myths: [
      "Git resolves overlapping edits automatically by taking the newer change",
      "a conflict means one of the branches has to be deleted",
    ],
  },
  {
    term: "the git stash",
    tags: ["workflow", "basics"],
    definition:
      "a stack that stores uncommitted changes so the working tree can be returned to a clean state",
    facts: [
      "pop applies the top entry and removes it from the stack",
      "untracked files are stashed only with the appropriate flag",
      "several stash entries can be held and applied in any order",
    ],
    myths: [
      "the stash includes untracked files by default",
      "stashed changes are pushed to the remote with the branch",
    ],
  },
  {
    term: "a git reset",
    tags: ["undo", "history"],
    definition:
      "the command that moves the current branch pointer and optionally adjusts the index and working tree",
    facts: [
      "soft moves only the branch pointer and keeps the changes staged",
      "mixed is the default and unstages the changes while keeping them in the tree",
      "hard discards the working tree changes as well",
    ],
    myths: [
      "reset with the soft option discards the changes it moves past",
      "reset is always safe because nothing is ever lost",
    ],
  },
  {
    term: "a git revert",
    tags: ["undo", "history"],
    definition:
      "the command that creates a new commit undoing the effect of an earlier one",
    facts: [
      "the original commit stays in the history",
      "it is the safe way to undo something already pushed to a shared branch",
      "reverting a merge commit requires naming which parent to keep",
    ],
    myths: [
      "revert removes the target commit from the history",
      "revert and reset achieve the same thing in a shared repository",
    ],
  },
  {
    term: "the git remote",
    tags: ["collaboration", "basics"],
    definition:
      "a named reference to another copy of the repository that you fetch from and push to",
    facts: [
      "origin is the conventional name for the primary remote",
      "a repository can have several remotes configured at once",
      "remote-tracking branches record where the remote was at the last fetch",
    ],
    myths: [
      "a repository can only ever have one remote",
      "committing locally updates the remote automatically",
    ],
  },
  {
    term: "the difference between fetch and pull",
    tags: ["collaboration", "workflow"],
    definition:
      "the distinction that one downloads remote history only while the other also integrates it into your branch",
    facts: [
      "fetch never changes your working tree",
      "pull is fetch followed by merge or rebase",
      "fetching first lets you review incoming commits before integrating",
    ],
    myths: [
      "fetch merges the downloaded commits into the current branch",
      "pull can never produce a conflict",
    ],
  },
  {
    term: "a detached HEAD",
    tags: ["basics", "workflow"],
    definition:
      "the state where HEAD points directly at a commit rather than at a branch",
    facts: [
      "commits made in this state belong to no branch",
      "they become unreachable once you check out a branch again",
      "creating a branch at that point preserves the work",
    ],
    myths: [
      "commits made in a detached HEAD state are lost immediately",
      "a detached HEAD prevents you from making commits",
    ],
  },
  {
    term: "the gitignore file",
    tags: ["configuration", "workflow"],
    definition:
      "a list of path patterns Git should not add to the repository automatically",
    facts: [
      "it only affects files that are not already tracked",
      "a tracked file must be removed from the index before the rule applies",
      "patterns can be negated to re-include a specific path",
    ],
    myths: [
      "adding a pattern removes the matching file from existing history",
      "an ignored file is still committed when it changes",
    ],
  },
  {
    term: "the git cherry-pick",
    tags: ["history", "workflow"],
    definition:
      "the command that applies the change from one commit onto the current branch as a new commit",
    facts: [
      "the resulting commit has a different identifier from the original",
      "it can conflict just like a merge",
      "a range of commits can be picked in one invocation",
    ],
    myths: [
      "cherry-pick moves the commit rather than copying it",
      "a cherry-picked commit keeps its original identifier",
    ],
  },
  {
    term: "an interactive rebase",
    tags: ["history", "workflow"],
    definition:
      "a rebase that pauses so commits can be reordered, reworded, squashed or dropped",
    facts: [
      "squash combines a commit into the one before it",
      "the commit list is edited before the replay begins",
      "it rewrites every commit it touches with a new identifier",
    ],
    myths: [
      "interactive rebase can reorder commits without changing their identifiers",
      "it is safe to run on a branch other people are working from",
    ],
  },
  {
    term: "the git reflog",
    tags: ["recovery", "history"],
    definition:
      "the local log of every position HEAD has held, including ones no branch points at any more",
    facts: [
      "it can recover commits orphaned by a hard reset",
      "it is local to your clone and never pushed",
      "entries expire after a configurable retention period",
    ],
    myths: [
      "the reflog is shared with everyone who clones the repository",
      "commits removed by a reset are gone with no way back",
    ],
  },
  {
    term: "a Git tag",
    tags: ["releases", "basics"],
    definition:
      "a fixed label attached to a specific commit, normally used to mark a release",
    facts: [
      "an annotated tag is a real object with a message and a tagger",
      "tags are not pushed by default and need an explicit push",
      "a tag does not move as new commits are added",
    ],
    myths: [
      "a tag advances with the branch it was created on",
      "pushing a branch pushes its tags as well",
    ],
  },
  {
    term: "a pull request",
    tags: ["collaboration", "review"],
    definition:
      "a request to merge one branch into another that provides a place for review and automated checks",
    facts: [
      "reviewers can comment on specific lines of the diff",
      "checks can be required to pass before merging is allowed",
      "squash merging collapses the branch into a single commit on the target",
    ],
    myths: [
      "a pull request is a Git feature rather than a hosting platform feature",
      "opening a pull request merges the branch immediately",
    ],
  },
  {
    term: "a fast-forward merge",
    tags: ["merging", "history"],
    definition:
      "a merge that simply advances the branch pointer because the target has not diverged",
    facts: [
      "it is possible only when the current branch is an ancestor of the other",
      "no merge commit is created",
      "the resulting history stays linear",
    ],
    myths: [
      "a fast-forward merge creates a merge commit with two parents",
      "a fast-forward is possible even when both branches have new commits",
    ],
  },
  {
    term: "a force push with lease",
    tags: ["collaboration", "safety"],
    definition:
      "a force push that is refused if the remote branch has moved since you last fetched it",
    facts: [
      "it protects against overwriting a colleague's newly pushed commits",
      "it is the safer default when publishing a rebased branch",
      "it still rewrites the remote branch when the check passes",
    ],
    myths: [
      "it behaves identically to a plain force push",
      "it merges the remote commits instead of replacing them",
    ],
  },
];
