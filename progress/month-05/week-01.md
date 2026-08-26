# Week 01: Git Internals & Modern Workflow

✅ done · deadline 2026-05-16 · 4/4 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-01.html)

[All weeks](../README.md) · [May 2026](README.md)

---

### Git Archaeology  ✅ done

Prove to myself that a Git commit is a pointer, not a snapshot, by walking the commit → tree → blob object chain by hand.

| Object types | Commands | Repo |
|---|---|---|
| 3 | 4 | Bayn |

**What I did**

Running git cat-file -p HEAD on my Bayn repo revealed that a commit is not a snapshot of files — it's a pointer. It stores a tree hash, a parent commit hash, and metadata like author and message. When I walked into the tree with git cat-file -p HEAD^{tree}, I could see every file and folder as a list of (type, name, hash) entries. Finally, reading the blob for notes.txt showed just the raw bytes with no metadata. Git builds up a complete picture by chaining three objects — commit → tree → blob — not by copying files.

```bash
git rev-parse HEAD
git cat-file -p HEAD
git cat-file -p HEAD^{tree}
git cat-file -p 9bdc6538
```

```
$ git rev-parse HEAD
969e5317038a82f0178cf812bdf4cc1caaae6fd9

$ git cat-file -p HEAD
tree 1ff311202b7189776ce88b12843376399061e606
parent 1a73a6acb6375882b0aeed527e6d1d65277be3e3
author ti <ququmaker9@gmail.com> 1767376516 +0300
committer ti <ququmaker9@gmail.com> 1767376516 +0300

style:new Chat UI

$ git cat-file -p HEAD^{tree}
100644 blob 81e8cf5358e371d518bec21d621f4dea81ca85b1	.gitignore
040000 tree 0aea480cb2f3655cff8deb72ac0422ad19356cfe	backend
100644 blob b627249315716c94bc7b0dad366cd4358a1e2175	color palate.xlsx
040000 tree 4511d248a53f72fc72615e8ce4b46f14df7e6c50	frontend
100644 blob 9bdc65389e988bf7be3e72f917aa22b5779aa421	notes.txt
040000 tree a05d8c5f809a0e1a5f03c5f13b32bd62d5622397	pic
100644 blob d5465afb22b0bad1f9736f6dc783922108a59434	storage.rules

$ git cat-file -p 9bdc6538
firebase deploy --only functions


cd X:/Drive/Projects/BetweenLines/frontend && npm run build && firebase deploy --only hosting

cd X:/Drive/Projects/BetweenLines/backend && npm run build && firebase deploy --only functions
```

- [Ti-03/Bayn](https://github.com/Ti-03/Bayn)
- [Week 01 full report](https://josa-openlab.github.io/Ti-progress/reports/week-01.html)

### Reflog Rescue Drill  ✅ done

Delete five commits with reset --hard, then prove nothing committed is ever truly lost by recovering them from the reflog.

| Commits dropped | Recovered |
|---|---|
| 5 | 100% |

**What I did**

Running git reset --hard HEAD~5 made it look like 5 commits were permanently gone — the log only showed e4d40bd and below. But git reflog revealed the full history of where HEAD has been, not just the commit chain. The lost commit 969e531 was sitting right there at HEAD@{1}. One reset --hard to that hash and everything was back, identical to before. The key insight: git reset doesn't delete objects, it just moves a pointer. The reflog tracks every pointer move, so nothing committed is ever truly lost.

```bash
git log --oneline -8
git reset --hard HEAD~5
git reflog
git reset --hard 969e531
git log --oneline -8
```

```
$ git log --oneline -8
969e531 (HEAD -> main, origin/main) style:new Chat UI
1a73a6a style:mobile header style
deacd47 style:add buttons and styling to the chat page
50351ff small files removale
76035ae rm some small files
e4d40bd small files
a841dc2  fix chat
49e1602 new

$ git reset --hard HEAD~5
HEAD is now at e4d40bd small files

$ git reflog
e4d40bd (HEAD -> main) HEAD@{0}: reset: moving to HEAD~5
969e531 (origin/main, origin/HEAD) HEAD@{1}: clone: from https://github.com/Ti-03/Bayn.git

$ git reset --hard 969e531
HEAD is now at 969e531 style:new Chat UI

$ git log --oneline -8
969e531 (HEAD -> main, origin/main) style:new Chat UI
1a73a6a style:mobile header style
deacd47 style:add buttons and styling to the chat page
50351ff small files removale
76035ae rm some small files
e4d40bd small files
a841dc2  fix chat
49e1602 new
```

- [Ti-03/Bayn](https://github.com/Ti-03/Bayn)
- [Week 01 full report](https://josa-openlab.github.io/Ti-progress/reports/week-01.html)

### Conventional Commits Refactor  ✅ done

Rewrite three messy commit messages deep in history into Conventional Commits with interactive rebase, then ship the clean history as a PR.

| Commits reworded | Rebase depth |
|---|---|
| 3 | HEAD~8 |

**What I did**

Used git rebase -i HEAD~8 to reach three messy commits deep in history and reword them. The key lesson: rebase -i doesn't just let you squash — it lets you rewrite any commit message in a range by marking it as reword. Git replays each commit one by one and pauses at each reword to let you change the message. The result is a clean, readable history that any maintainer can parse at a glance. force-with-lease is safer than force-push because it refuses to overwrite if someone else pushed to the branch since you last fetched.

```bash
git checkout -b feature/clean-history
git rebase -i HEAD~8
git push origin feature/clean-history
```

```
$ git log --oneline -8 --reverse
a344ead style:new Chat UI
7e901c4  fix: resolve message rendering bug in chat UI
2ccc6ad small files
e6baeb0 rm some small files
9c74eb8 chore: remove unused static assets
551a1a5 style:add buttons and styling to the chat page
47aef26 style:mobile header style
f54d024 (HEAD -> feature/clean-history) feat: add initial chat page structure

$ git push origin feature/clean-history
* [new branch] feature/clean-history -> feature/clean-history
```

- [Conventional Commits refactor](https://github.com/Ti-03/Bayn/pull/1)
- [Ti-03/Bayn](https://github.com/Ti-03/Bayn)
- [Week 01 full report](https://josa-openlab.github.io/Ti-progress/reports/week-01.html)

### BLUF Writing  ✅ done

Practice BLUF (bottom line up front) writing so every async message leads with the conclusion or the ask, the way open-source communication demands.

| Rules |
|---|
| 3 |

**What I did**

Open source is asynchronous. The discipline: lead every message with the conclusion or the ask, then provide context. Three rules: subject line is a contract, show your work not just the conclusion, explicit beats clever.

- [Week 01 full report](https://josa-openlab.github.io/Ti-progress/reports/week-01.html)

