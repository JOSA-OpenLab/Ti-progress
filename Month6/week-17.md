# Week 17: A Name Missing Since 2019

🟡 in progress · deadline 2026-10-28 · 0/1 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-17.html)

[All weeks](../PROGRESS.md) · [Month6 (October 2026)](README.md)

---

### Three Settings, Two Names  🟡 in progress

Week 15's fix was a menu that read one step past the end of a table. That kind of bug comes from a habit, not a one-off slip: someone adds an option to an enum and forgets the menu that lists it. So I went looking for other tables in the goggles menu that had fallen behind their enums, checked every open issue first so I would not duplicate anyone, and required proof on real code before filing.

**What I did**

Before picking anything I went through every open Betaflight issue. Most of the small ones already had a pull request, one maintainer had already fixed another locally, and the rest needed a design decision from a maintainer. So the best target came from my own shortlist, re-checked against the latest master.

The OSD timers can count in seconds, hundredths or tenths. Tenths was added in 2019 by #8290, which updated the timer code and its test but not the goggles menu. The menu's name table still had two names, while the menu allowed values up to 2. A pilot who picks Tenth in the configurator and then opens the OSD menu's TIMERS page makes the firmware read a third name that does not exist, so it draws whatever pointer sits next in memory. On an F405 that is a pointer to an unrelated RC-preview variable. It has been in every release since 4.1.

Testing caught two of my own mistakes. Betaflight's SITL build, which I used in earlier weeks, compiles the OSD menus out entirely, so a SITL test would have proved nothing; I switched to real ARM builds. And my first unit test failed for the wrong reason: the menu kept its state between runs, so the second and third runs never re-read the setting. I fixed the test, not the firmware, and only trusted the result once each run showed the value it was given.

The proof has three parts. A compile-time size check stops the real F405 firmware build on master and passes with the fix. AddressSanitizer on the real menu code reports a read 0 bytes past the end of the table on master, and with the fix the menu draws SCND, HDTH and TNTH cleanly. Then 9 ARM targets, make checks and all 1383 unit tests pass. The fix is two lines: the missing name, plus that size check, using the same pattern the firmware already uses elsewhere so a future option cannot be added without its name.

The same week, the radio-script fix from Week 12, betaflight-tx-lua-scripts#548, was approved and merged by haslinghuis after five weeks open.

```bash
make STM32F405 -j16                       # with the size check, on master and on the fix
make ../../obj/test/cms_timer_scratch_unittest/cms_timer_scratch_unittest COVERAGE_FLAGS="--coverage -fsanitize=address"
make STM32F411 STM32F722 STM32F745 STM32G474 STM32H723 STM32H743 AT32F435G AT32F435M
make checks
make test
```

```
Size check, real STM32F405 build
  master:  error: static assertion failed: "timer_precision_names_cover_every_precision"
  fixed :  builds, hex produced

Real cms.c + real TIMERS menu under ASan, timer set to Tenths
  master:  ERROR: AddressSanitizer: global-buffer-overflow
           cmsDrawMenuEntry cms.c:470
           0 bytes after global variable 'osdTimerPrecisionNames' (size 16)
  fixed :  1 PREC  SCND / HDTH / TNTH, no reports

src/main/cms/cms_menu_osd.c  +2 -1

9 ARM targets   0 errors
make checks     ok
Unit tests      1383 passed, 0 failed

Also this week
  betaflight-tx-lua-scripts#548  MERGED 2026-10-22 by haslinghuis
```

- [betaflight#15891](https://github.com/betaflight/betaflight/pull/15891)
- [betaflight#8290, where tenths was added in 2019](https://github.com/betaflight/betaflight/pull/8290)
- [betaflight/betaflight](https://github.com/betaflight/betaflight)
- [Week 17 full report](https://josa-openlab.github.io/Ti-progress/reports/week-17.html)

