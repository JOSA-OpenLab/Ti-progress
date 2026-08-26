# Week 05: Testing, CI/CD & GitHub Actions

✅ done · deadline 2026-06-13 · 4/4 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-05.html)

[All weeks](../PROGRESS.md) · [Month2 (June 2026)](README.md)

---

### Add Tests Where There Are None  ✅ done

Resurrect a stale Swift test suite after a rect → radial redesign and ship 12 rewritten Arrange/Act/Assert tests via a public PR.

| Tests | Rewritten | Failures |
|---|---|---|
| 20 | 12 | 0 |

**What I did**

Rewrote the unit tests in MacDirStat (my public Swift app). The treemap had been redesigned from a rectangular layout into a radial sunburst, so six existing tests still asserted on the removed TreemapCell.rect API and no longer compiled. I rewrote all 12 against the radial model (startAngle/endAngle/innerRadius/outerRadius), preserving each test's original intent, and fixed a ByteFormatter test that wrongly assumed binary (1024^3) units when the formatter defaults to decimal SI. Every test follows Arrange/Act/Assert and is named for the behavior. The suite is now 20 passing tests.

```bash
swift test
```

```
Test Suite 'TreemapLayoutTests' passed.
  Executed 12 tests, with 0 failures (0 unexpected) in 0.001s
Test Suite 'All tests' passed at 2026-06-29 19:34:36.
  Executed 20 tests, with 0 failures (0 unexpected) in 0.008 (0.010) seconds
```

- [MacDirStat: tests + CI](https://github.com/Ti-03/MacDirStat/pull/8)
- [Ti-03/MacDirStat](https://github.com/Ti-03/MacDirStat)
- [Week 05 full report](https://josa-openlab.github.io/Ti-progress/reports/week-05.html)

### Build a Real CI Workflow  ✅ done

Ship a real CI pipeline so 'works on my machine' bugs get caught on every PR. The matrix immediately caught a macOS SDK portability bug.

| Matrix | SDK bug caught | CI |
|---|---|---|
| 2 OS | 1 | green |

**What I did**

Added .github/workflows/ci.yml to MacDirStat: a matrixed build-test job across macos-15 (Xcode 16 / Swift 6.1) and macos-26 (Xcode 26 / Swift 6.2, the real Liquid Glass shipping toolchain), on every push to main and every PR. It caches SwiftPM keyed on Package.resolved, runs swift build -v as the static-analysis gate (Swift + StrictConcurrency is the Testing Trophy's static base), then swift test. No Linux or separate lint job: a macOS-only SwiftUI app can't build on Linux. The matrix immediately earned its keep, the first run was red because GlassCompat used macOS 26 Liquid Glass APIs (and ContentView uses macOS 15 MeshGradient) guarded only by a runtime #available, which doesn't make code compile against an older SDK. Fixed with a compile-time #if compiler(>=6.2) guard and by dropping macos-14 (whose SDK lacks both symbols). Now green on both cells. CI badge added to the README.

```bash
swift build -v
swift test
gh pr checks 8
```

```
Build & Test (macos-15)  pass  26s
Build & Test (macos-26)  pass  57s
(green on PR #8)
```

- [MacDirStat: tests + CI](https://github.com/Ti-03/MacDirStat/pull/8)
- [Ti-03/MacDirStat](https://github.com/Ti-03/MacDirStat)
- [Week 05 full report](https://josa-openlab.github.io/Ti-progress/reports/week-05.html)

### Run It Locally with act  ✅ done

Run the workflow locally with act across two repos: a macOS app can't run under act at all, but on a Node repo act caught two real bugs before GitHub did.

| Bugs caught locally | Repos |
|---|---|
| 2 | 2 |

**What I did**

Done across two repos. (1) MacDirStat shows act's hard limit: act runs GitHub Actions in Linux Docker containers, so a macOS job has no equivalent (no macOS container image exists, Apple licensing), it can't build the app at all. (2) adcli, a private Node/TypeScript monorepo, is where act actually runs, and it caught two real failures before they hit GitHub: @adcli/sdk wasn't resolvable in a clean checkout because its dist/ is gitignored (passed on my machine only from leftover build output), fixed with a build-libraries step; and tsc --noEmit flagged 4 pre-existing type errors in backend test mocks/page props. Differences I hit with act vs hosted runners: arm64 vs x86_64 (amd64 emulation broke setup-node), no psql in the image (switched migrations to the pg-based migrate.mjs), had to pin the runner image, and Postgres service port clashes on host 5432. Both jobs pass under act. Write-ups in MacDirStat docs/ci-journal.md and adcli docs/ci-act-journal.md.

```bash
act -j lint -P ubuntu-latest=catthehacker/ubuntu:act-latest
act -j test --matrix node:22 -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

```
lint: green
test matrix (Node 20 + 22): green
all packages pass (sdk 63, cli 172, marketing 97, backend 171)
```

- [MacDirStat PR #8 (ci-journal.md)](https://github.com/Ti-03/MacDirStat/pull/8/files)
- [Ti-03/MacDirStat](https://github.com/Ti-03/MacDirStat)
- [Week 05 full report](https://josa-openlab.github.io/Ti-progress/reports/week-05.html)

### Time Management & Deep Work  ✅ done

Apply time-boxing and single-tasking to the debugging-heavy CI work, and batch commits into logical chunks instead of committing reactively.

| Soft skill |
|---|
| Deep work |

**What I did**

Getting a stale test suite to compile is exactly the kind of work that punishes fragmentation: chasing the Sparkle/Package.swift gap, the radial-redesign test breakage, and the ByteFormatter unit bug needed sustained focus, not Slack-interrupted minutes. I time-boxed the debugging and worked one repo at a time, and batched the commits into three logical chunks (tests, CI, docs) rather than committing reactively.

- [Week 05 full report](https://josa-openlab.github.io/Ti-progress/reports/week-05.html)

