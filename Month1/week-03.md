# Week 03: Issue Triage & Bug Reproduction

✅ done · deadline 2026-05-30 · 5/5 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-03.html)

[All weeks](../PROGRESS.md) · [Month1 (May 2026)](README.md)

---

### Reproduce One Issue  ✅ done

Reproduce httpie#1640 and prove that 'can't reproduce on a clean install' is itself a finding: the bug lived in one transitive dependency version.

| Issue | Trigger | Boundary |
|---|---|---|
| #1640 | multidict 6.5.0 | 1 header |

**What I did**

Reproduced httpie/cli#1640 (JSON Content-Type dropped when a single custom header is present). A fresh install didn't reproduce it, which was the clue: the bug lives in a dependency, not httpie. By pinning multidict==6.5.0 (a yanked version) in an isolated uv venv and changing nothing else, I isolated the exact trigger and confirmed the root cause. The boundary turned out to be precise: 0, 2, and 3 headers all keep Content-Type; only a single header drops it. I also verified it's genuinely sent that way — pie.dev echoed back no Content-Type — so it wasn't just a display quirk. Lesson: 'can't reproduce on a fresh install' is itself a finding; the difference between my machine and the reporter's was a single transitive dependency version.

```bash
uv venv httpie-repro && source httpie-repro/bin/activate && uv pip install httpie
uv pip install 'multidict==6.5.0'  # yanked, buggy version
http --print=H --ignore-stdin post pie.dev/post 'header1: xyz' x=1   # Content-Type MISSING
http --print=H --ignore-stdin post pie.dev/post 'header1: xyz' 'header2: abc' x=1   # Content-Type present
uv pip install -U multidict  # -> 6.7.1; single-header case fixed
```

```
Boundary under multidict 6.5.0 (Content-Type: application/json present?):
  0 headers: PRESENT
  1 header:  MISSING  <- bug
  2 headers: PRESENT
  3 headers: PRESENT
Server echo (pie.dev) for 1-header request confirms Content-Type was not sent.
After upgrading multidict to 6.7.1: 1-header case PRESENT (fixed).
```

- [Reproduction write-up](https://github.com/httpie/cli/issues/1640)
- [httpie/cli](https://github.com/httpie/cli)
- [Week 03 full report](https://josa-openlab.github.io/Ti-progress/reports/week-03.html)

### Build One MCVE  ✅ done

Reduce the whole httpie reproduction to a 3-line, network-free MCVE that fails on exactly 5 keys, so the bug is undeniable and CI-checkable.

| Repro size | Min trigger | Network |
|---|---|---|
| 3 lines | 5 keys | none |

**What I did**

Reduced the sprawling #1640 reproduction (a uv venv + httpie install + a network call to pie.dev) down to a 3-line pure-Python MCVE that needs only multidict and no network. The reduction process was mechanical: trace httpie's apply_missing_repeated_headers() to find it does popone() then update(), reproduce that directly on a CIMultiDict, then minimize the input. The minimization surprised me — exactly 5 keys triggers it; 4 and 6 don't, because it's a hash-table internals bug, not a logic bug. I made it self-verifying with an assert + exit code so it doubles as a bisect/CI probe. Lesson: a good MCVE removes everything that isn't the bug; here that meant deleting httpie and the network entirely and landing on the multidict operation that actually fails.

```bash
# Found the failing op in httpie: client.py -> apply_missing_repeated_headers() does popone() then update()
python mcve_repro.py   # on multidict==6.5.0 -> AssertionError, exit 1
pip install -U multidict && python mcve_repro.py   # 6.7.1 -> ok, exit 0
```

```
from multidict import CIMultiDict
md = CIMultiDict({'a':'1','b':'2','c':'3','d':'4','e':'5'})
md.popone('a')          # remove first key
md.update([('a','1')])   # add it back
assert set(md.keys()) == {'a','b','c','d','e'}  # fails on multidict==6.5.0

Minimum trigger = exactly 5 keys (4 and 6 do not reproduce).
Matches the upstream regression test in aio-libs/multidict#1196.
```

- [MCVE posted on #1640](https://github.com/httpie/cli/issues/1640#issuecomment-4628686732)
- [aio-libs/multidict](https://github.com/aio-libs/multidict)
- [Week 03 full report](https://josa-openlab.github.io/Ti-progress/reports/week-03.html)

### Run a Bisect  ✅ done

Bisect the exact commit behind the bug, discovering first that it only reproduces in multidict's compiled C extension, not the pure-Python fallback.

| Window | Steps | Culprit |
|---|---|---|
| 7 commits | 3 | 9d3c53f |

**What I did**

I bisected the exact commit behind the same bug as Tasks 1 and 2, feeding the bisect my 5-key MCVE as the good/bad probe. Two things made it more than a mechanical run. First, the bug only lives in multidict's compiled C extension: with MULTIDICT_NO_EXTENSIONS=1 (the pure-Python fallback) every version is GOOD, so there was no Python line to bisect — each step had to rebuild the extension with `build_ext --inplace`, and my `git bisect run` script returns 125 to skip any commit that won't compile. Second, the version window was unusually sharp: 6.4.4 GOOD, 6.5.0 BAD, 6.5.1 GOOD — the regression existed in exactly one release, which is why 6.5.0 was yanked from PyPI. Bisecting v6.4.4..v6.5.0 (7 commits) took just 3 automated builds — textbook O(log n) — and landed on 9d3c53f, 'Replace pair_list with hash table (#1128)'. That commit swapped multidict's internal storage from a linked pair-list to a CPython-dict-style hash table for O(1) lookups; the new tombstone/index bookkeeping mishandled delete-then-reinsert, dropping a sibling key. Lesson: 'which version broke it' and 'which commit broke it' are different questions — bisect answers the second mechanically, but only after you have a reproducer that emits a clean good/bad signal, and here that first meant discovering the bug was in C, not Python.

```bash
git clone https://github.com/aio-libs/multidict.git && cd multidict
# probe = Task 2's 5-key MCVE; only fails under the compiled C extension (pure-Python is GOOD)
git bisect start v6.5.0 v6.4.4   # bad = 6.5.0 (yanked), good = 6.4.4
git bisect run bash bisect_test.sh   # each step: build_ext --inplace, run MCVE, exit 0/1 (125=skip)
git bisect reset
```

```
Reproducer signal (C extension): 6.4.4 GOOD | 6.5.0 BAD | 6.5.1 GOOD
(BAD only in the compiled extension; MULTIDICT_NO_EXTENSIONS=1 pure-Python is GOOD on every version)

Bisecting v6.4.4..v6.5.0 -- 7 commits, ~3 steps:
  good  87c76b8  Fix failed spelling task (#1168)
  good  bdbbc48  Bump pytest-cov from 6.0.0 to 6.1.0 (#1119)
  bad   9d3c53f  Replace pair_list with hash table (#1128)

9d3c53f is the first bad commit  (parent bdbbc48 = GOOD)
Andrew Svetlov, 2025-06-17 -- 7 commits resolved in 3 builds = O(log n).
```

- [First bad commit: hash table swap](https://github.com/aio-libs/multidict/commit/9d3c53f28c4c18b1a032af45d013a0bbe12821b9)
- [aio-libs/multidict](https://github.com/aio-libs/multidict)
- [Week 03 full report](https://josa-openlab.github.io/Ti-progress/reports/week-03.html)

### Triage an Issue  ✅ done

Triage a crash in create-t3-app against the published artifact (not repo HEAD), then post a polite correction when the original analysis was off.

| Issue | Version |
|---|---|
| #2215 | 7.40.0 |

**What I did**

Triaged an unconfirmed bug in a different repo from #1640 for breadth: t3-oss/create-t3-app#2215, where the --import-alias flag crashes with a TypeError in CI mode. I confirmed it on the current npm latest (create-t3-app@7.40.0) rather than from the source tree, which mattered: the released build registers the flag as a plain boolean (.option('-i, --import-alias', '...', '~/') with NO [alias] value placeholder), so Commander discards the passed '@/' and sets importAlias to true; the guard `if (importAlias !== '~/')` then passes and setImportAlias() calls .replace() on a boolean. I also issued a polite correction: the original analysis assumed an optional [alias] resolving to true, but in the released build there is no value placeholder at all — the flag never accepts a value. The current main source does use '-i, --import-alias [alias]', which wouldn't crash, but that isn't in 7.40.0. Lesson: triage the artifact the reporter actually ran (the published dist), not the repo's HEAD — the two had diverged, and reading HEAD alone would have produced a wrong 'cannot reproduce'.

```bash
npx create-t3-app@7.40.0 my-app --CI --tailwind --appRouter --eslint --import-alias "@/"   # confirmed crash
# read the PUBLISHED dist (not repo HEAD) to find the real root cause
npm view create-t3-app@7.40.0 dist.tarball   # inspect the released build's .option() registration
```

```
Confirmed on create-t3-app@7.40.0 (npm latest); Node 26.0.0, npm 11.12.1, macOS (Darwin 25.5.0).
Outcome: scaffolds, then crashes with `TypeError: i.replace is not a function` (as reported).

Root cause in the released build:
  .option('-i, --import-alias', '...', '~/')   <- registered as a BOOLEAN, no [alias] placeholder
  -> Commander discards the passed "@/" and sets importAlias = true
  -> guard `if (importAlias !== '~/')` passes (true !== '~/')
  -> setImportAlias() calls .replace() on a boolean -> crash
Correction to original analysis: the released build has NO value placeholder at all (not an optional
[alias] resolving to true). main source uses `-i, --import-alias [alias]`, but that isn't in 7.40.0.
```

- [Triage comment on #2215](https://github.com/t3-oss/create-t3-app/issues/2215#issuecomment-4628828443)
- [t3-oss/create-t3-app](https://github.com/t3-oss/create-t3-app)
- [Week 03 full report](https://josa-openlab.github.io/Ti-progress/reports/week-03.html)

### Active Listening  ✅ done

Practice active listening in issue threads: restate the reporter's problem in their own terms before proposing a cause.

| Soft skill |
|---|
| Listening |

- [Week 03 full report](https://josa-openlab.github.io/Ti-progress/reports/week-03.html)

