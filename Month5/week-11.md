# Week 11: Open-Source Contribution Sprint

✅ done · deadline 2026-09-10 · 3/3 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-11.html)

[All weeks](../PROGRESS.md) · [Month5 (September 2026)](README.md)

---

### Land a Real Fix in a Real Project  ✅ done

Stop researching and get something merged. The Week 10 plan assumed I would fix a diagnosed firmware issue; that issue was fixed by someone else while I prepared. This week the goal was narrower and harder to dodge: find a genuine bug myself, prove it, write a test that fails without the fix, and see it through review to merge.

**What I did**

The blackbox log viewer decodes the flight-mode bitfield by walking it one bit at a time, and it walked it with `flags >>= 1`. In JavaScript `>>` coerces its operand to a signed 32-bit integer, so the moment bit 31 is set the value goes negative, the `flags > 0` loop condition fails after a single iteration, and every remaining flag is silently dropped. The fix is `>>>=`, one extra character.

Bit 31 is not a hypothetical. `flightModeFlags` carries the firmware's `rcModeActivationMask`, and bit 31 is PREARM on 2025.12 and CRASHFLIP on 2026.6. So a pilot flying 2025.12 with a toggle PREARM switch had a values panel that read "ARM" for the entire log, and any frame where only high bits were set rendered as "0", indistinguishable from no flags at all. Nobody reported it. I found it by reading the source.

What took the actual time was proving it rather than fixing it. I checked that the mask reaches the function as a positive number, so the truncation really is caused by the shift and not by something upstream. I checked that every resolved name table has more than 32 entries, so widening the scan cannot read past the end. I checked the neighbouring code paths and found that CSV export and the graph annotations were already correct, which meant I could not claim the bug was broader than it was. I wrote seven test cases, including two that pin the real bit-31 mode name on 2025.12 and 2026.6, and confirmed five of them fail against the unpatched code. One of those tests initially passed for the wrong reason because I handed `adjustFieldDefsList` a string where it wanted a numeric firmware constant, so it silently took the pre-3.3 branch; catching that was the difference between a test that proves something and a test that looks like it does.

Review taught me the thing I could not have read anywhere. blckmn requested one change: new files in this repo must open with the GPL header from `DEFAULT_LICENSE.md`. That rule lives in `AGENTS.md`, it is marked as not yet enforced by tooling, CI does not lint `test/` at all, and not one of the other 104 files in `test/js/` has the header. Two test files had merged without it the day before. So grepping for local convention actively told me the opposite of the rule, and only a human who wrote the rule would catch it. I added the header as a separate commit, replied on his thread, and he approved within the hour. haslinghuis approved three minutes later and it merged fourteen minutes after that.

```bash
npx vitest run test/js/blackbox_fields_presenter.test.js
git log --oneline -1 upstream/master
```

```
PASS (7) FAIL (0)
Full suite: 416/416 suites, 1283/1283 tests

c5ab3dba  fix(blackbox): show all flight mode flags when bit 31 is set (#5511)

Merged  2026-09-10 07:41 UTC by haslinghuis
Label   RN: BUGFIX
Milestone 2026.12
Diff    2 files, +79 -1  (1 line of fix, 76 of test, 21 of licence header)
Repo    betaflight/betaflight-configurator, 3,308 stars
```

- [betaflight-configurator#5511 (MERGED)](https://github.com/betaflight/betaflight-configurator/pull/5511)
- [c5ab3dba on master](https://github.com/betaflight/betaflight-configurator/commit/c5ab3dbafa1044d8c4b353cf2d7bb86bc563bfd8)
- [The one-character fix](https://github.com/betaflight/betaflight-configurator/pull/5511/files)
- [Week 11 full report](https://josa-openlab.github.io/Ti-progress/reports/week-11.html)

### Find Bugs by Reading Code, Not Issue Lists  ✅ done

Week 10 ended with the lesson that issue lists go stale: five shortlisted issues turned out closed or already claimed. So this week I stopped shopping the issue tracker and went looking in the source instead, and tried to make each finding useful to a maintainer even when I could not fix it myself.

**What I did**

The clearest find was a missing comma. In `blackbox_fielddefs.c` the failsafe phase name table was written across lines without a comma after `"LANDED"`, so C did what C does and concatenated the two adjacent string literals. The table held five entries instead of six, and index 3 decoded as the single string `"LANDEDFAILSAFE_RX_LOSS_MONITORING"`. The accompanying count was also stale at 4, so any phase above 3 fell through to a raw integer. This is the default output path of the decoder, which means every log containing a failsafe has decoded wrongly since February 2018. I proved it by compiling the project's own source and printing the array rather than by reading and asserting, checked the firmware enum is append-only from v2.5.0 so no version gating was needed, and completed the table with GPS_RESCUE and AUTOPILOT. Two files, eight lines added. A core maintainer approved it 24 minutes after I opened it.

The more interesting contribution was arguing against a fix. Issue #72 reported that flight mode names decode wrongly and proposed a corrected static table. The mislabelling is real, but the proposed fix would have broken more logs than it repaired, because blackbox records the `boxId_e` enum ordinal rather than the stable MSP box ID, and those ordinals shift between firmware releases. I read `rc_modes.h` at each release tag and posted the table showing where `BOXAIRMODE` actually lands per version. The reporter agreed that a version-aware mapping was what they had meant, and asked me to do the port. That is the piece I have not written yet.

Two smaller ones. On #15560 I corrected the maintainer's own ticket: the dead `RCC_AHB` macro he described as compiling on three chips compiles on none, which I demonstrated with a control search so that a zero result could not be dismissed as a bad path. nerdCopter reacted with a heart. On #15642 I reproduced the `linux-aarch64` toolchain gap that blocks `make` on ARM Linux and on Docker under Apple Silicon, and confirmed the three-line fix works; it had been approved by two maintainers and sat unmerged for over a week because nobody had the hardware to confirm it.

The habit that keeps paying off is checking every claim against current master before posting it. It has changed the outcome every single time. A count of 648 apparently dead translation keys collapsed to 20 real ones once I accounted for keys built dynamically at runtime. A cleanup I had queued got dropped because the maintainer had asked whether it should be done at all and never got an answer. A decoder fix got dropped because the reference implementation I was told to port from is itself wrong.

```bash
gcc -o /tmp/probe probe.c src/blackbox_fielddefs.c && /tmp/probe
for tag in 4.0.0 4.3.0 2025.12.0 2026.6.0; do git show $tag:src/main/fc/rc_modes.h | grep -n BOXAIRMODE; done
```

```
table[3] = "LANDEDFAILSAFE_RX_LOSS_MONITORING"   <-- two literals concatenated
FLIGHT_LOG_FAILSAFE_PHASE_COUNT = 4          <-- stale, should be 8

boxId_e ordinal of BOXAIRMODE shifts across releases,
so a single static name table cannot be correct for all logs.
```

- [blackbox-tools#75 (approved, awaiting merge)](https://github.com/betaflight/blackbox-tools/pull/75)
- [blackbox-tools#72 (showed the proposed fix would break logs)](https://github.com/betaflight/blackbox-tools/issues/72)
- [betaflight#15560 (corrected the ticket's own premise)](https://github.com/betaflight/betaflight/issues/15560)
- [betaflight#15642 (reproduced the toolchain gap)](https://github.com/betaflight/betaflight/pull/15642)

### Cadence: What Slipped and Why  ✅ done

Weeks 1 to 9 were submitted on time, every Saturday. Week 10 landed a month late and this entry is a month after that. The coordinators raised it directly, and a progress log that quietly skips the gap is not a progress log.

**What I did**

The early cadence held because the weekly tasks were self-contained: read a thing, do a thing, write it up. Once the apprenticeship turned into contributing to a live project, the unit of work stopped fitting inside a week. A PR is not done when I push it, it is done when a maintainer with no obligation to me decides to look. #5511 sat between opening and merging for a day, which is fast, and #75 has been approved and unmerged for a day, and #15642 sat approved and unmerged for over a week. None of that is under my control, and I had no way of logging progress for a week whose output was "waiting".

That is the honest half. The other half is that I was running several other things at the same time and let this one drift, and the right move would have been to log the waiting rather than log nothing. A week that reads "opened two PRs, both in review, here is what I found while waiting" is a real week. Silence for a month reads as absence even when the work happened, which is exactly how it was received.

The fix I am actually applying: record the week on its deadline regardless of whether anything merged, because merge timing belongs to the maintainer and effort belongs to me, and those are two different things to report.

One more contribution outside Betaflight this period. PRAXIST is a 6,319-star agent framework that carries 33 legacy files excluded from its type checker as declared debt, with the documented instruction that each graduates out as it is touched. `praxist/core/role_skills.py` was already clean, so it could leave the exclusion list with no source change: a single deleted line. The work was in proving it, and it is where I made the mistake worth recording. My first draft of that PR claimed the type checker reported 17 errors on main. It reports zero. My 17 were entirely my own environment: I had not synced an optional dependency group, and I was running on macOS where platform narrowing produces three errors CI never sees. I also quoted a file count from a Homebrew-installed linter instead of the version pinned in the lockfile, and test counts polluted by bytecode caches my own earlier command had created. Posting "17 errors on main" to a repo whose public CI log shows zero would have made a maintainer distrust every other line in that PR. The lesson is narrow and permanent: run the project's tool through the project's lockfile, never the copy on your machine, and reproduce CI's platform before quoting a number to anyone.

```bash
uv sync --group dev --extra product-usage-server
uv run pyrefly check --python-platform linux
```

```
Before syncing extras, on macOS : 17 errors   <-- all mine, none real
After, reproducing CI's platform :  0 errors   <-- matches CI exactly

With a deliberate type error appended to the module:
  main   : 0 errors   (the exclusion hid it)
  patch  : 1 error    (bad-return, role_skills.py:294)
```

- [sapientinc/PRAXIST#195 (open)](https://github.com/sapientinc/PRAXIST/pull/195)
- [Week 11 full report](https://josa-openlab.github.io/Ti-progress/reports/week-11.html)

