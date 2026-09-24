# Week 13: The Work After the Pull Request

✅ done · deadline 2026-09-24 · 2/2 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-13.html)

[All weeks](../PROGRESS.md) · [Month5 (September 2026)](README.md)

---

### The Bug My Own Fix Uncovered  ✅ done

Week 12 ended with a merged fix to the blackbox log viewer. Fixing one thing in a table usually shows you the next thing, and it did: once the viewer stopped dropping the top flight mode bit, the name sitting on that bit turned out to be wrong. This is the cheapest kind of contribution to find, and the easiest to argue, because the evidence is the change you already made.

**What I did**

The blackbox log viewer turns a flight recording into a chart a pilot can read. Part of that is translating a bitmask of active flight modes into names. The viewer keeps its own name tables, one per firmware era, and reads them by position: bit 0 is the first name, bit 1 the second, and so on.

The table had no entry for PARALYZE. Because the lookup is positional, a missing entry does not produce a blank, it shifts every name after the gap down by one. On firmware 4.0 through 4.5, where PARALYZE lands exactly on bit 31, the viewer labelled it USER1.

That bit was invisible until last week. My earlier merged fix, #5511, stopped the viewer dropping every flight mode above bit 31; making bit 31 readable is what exposed the wrong name behind it. One fix created the conditions to see the next.

PARALYZE is a sticky mode, latched until the quad is power cycled. So this was not a flicker. A log that entered PARALYZE carried the wrong name for the rest of the flight, in the status bar and as an annotation on the chart.

Two inserted lines. The work was proving the insert is safe everywhere else, because a positional table is exactly the kind of thing where a correct fix in one era silently breaks another. I resolved the table for every release from 3.3 to 2026.6 and diffed it index by index against the firmware's own mode enum parsed from rc_modes.h at each tag. Bits 0 to 31 match at all of them afterwards. The pre-3.3 table is deliberately untouched, because that firmware has no such mode.

Merged in under two hours.

```bash
git checkout <tag> -- src/main/fc/rc_modes.h   # at every release 3.3 -> 2026.6
node diff_tables.js   # viewer table vs firmware enum, index by index
```

```
Firmware 4.0 - 4.5, bit 31
  before:  USER1        <- wrong, and sticky for the whole flight
  after :  PARALYZE

Index-by-index check, bits 0-31, after the fix:
  3.3   match      4.4     match
  3.4   match      4.5     match
  4.0   match      2026.6  match
  ...
  pre-3.3 table deliberately untouched (no such mode)

+23 lines, 2 files. Opened 12:49 UTC, merged 14:44 UTC.
```

- [betaflight-configurator#5537 (MERGED)](https://github.com/betaflight/betaflight-configurator/pull/5537)
- [betaflight-configurator#5511, the earlier fix](https://github.com/betaflight/betaflight-configurator/pull/5511)
- [betaflight/betaflight-configurator](https://github.com/betaflight/betaflight-configurator)
- [Week 13 full report](https://josa-openlab.github.io/Ti-progress/reports/week-13.html)

### A Setting the Firmware Never Read  ✅ done

Everything I have sent to Betaflight so far has been in the tooling around the flight controller: the log viewer, the radio scripts. This one is in the firmware that actually flies the quad, which is a higher bar for review and a better test of whether the habit holds when the code is safety-adjacent.

**What I did**

Blackbox logging lets a pilot switch individual groups of fields off, to save space or to log faster. One of those switches is blackbox_disable_servos.

The firmware decides whether to log the servo fields with one expression. It asked whether the aircraft has servos, and then tested the field selector constant itself instead of asking whether that selector is enabled. The constant is 15, which is not zero, so that half of the expression was always true. The whole condition collapsed to just 'does this aircraft have servos'. Setting blackbox_disable_servos did nothing at all.

What made it easy to argue is that the surrounding code already disagrees with itself. That same function performs twenty of these selector checks. Nineteen wrap the selector in isFieldEnabled(). One did not. The fix is to make the twentieth look like the other nineteen: one line.

The review is the part worth writing down. Two maintainers approved it within hours. Then the review bot asked for a regression test, and the shape it suggested would have roughly tripled the size of the change to a file that flies aircraft. A bigger diff is not a better answer to 'please prove this'.

The smaller version was to make the existing test harness able to see the bug at all. The function is file-local, so I exposed it through the project's own STATIC_UNIT_TESTED macro, which expands to nothing under the test build and to static everywhere else, so the shipped firmware is unchanged. The test harness stubbed hasServos() to a constant false, which meant the path could never be reached, so I made the stub settable. One test, three cases: the selector clear, the selector set, and no servo mixer at all.

Then the control that makes it mean something. I put the old one-line expression back while keeping the new test, and the suite fails on exactly one case, the one where the selector is set: Actual true, Expected false. The other eleven tests still pass. With the fix, twelve of twelve. A test that does not fail against the unpatched code is not evidence of anything.

Both human approvals survived the rebase and force-push, and the bot's next pass came back with approval recommended and no unresolved findings. Merged by haslinghuis on 2026-09-23, five days after opening.

```bash
make test_blackbox_unittest              # 12/12 with the fix
# put back ONLY the old expression, keep the exposure and the test, then re-run
make STM32F405 EXTRA_FLAGS=-Werror       # exit 0, zero warnings
```

```
UNPATCHED (old expression, new test)
  [  FAILED  ] BlackboxTest.Test_servo_field_disable
    Value of: testBlackboxConditionUncached(FLIGHT_LOG_FIELD_CONDITION_SERVOS)
      Actual: true
    Expected: false
  11 other tests: PASSED

PATCHED
  [  PASSED  ] 12 tests

Firmware build, STM32F405, -Werror
  exit 0, warnings: 0

Review
  haslinghuis   APPROVED
  blckmn        APPROVED   (both survived the force-push)
  copilot       approval recommended, no unresolved findings

MERGED 2026-09-23 17:31 UTC by haslinghuis
```

- [betaflight#15719 (MERGED)](https://github.com/betaflight/betaflight/pull/15719)
- [betaflight/betaflight](https://github.com/betaflight/betaflight)
- [Week 13 full report](https://josa-openlab.github.io/Ti-progress/reports/week-13.html)

