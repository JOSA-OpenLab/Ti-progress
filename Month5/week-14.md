# Week 14: Ten Times Too Small

🟡 in progress · deadline 2026-09-30 · 0/1 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-14.html)

[All weeks](../PROGRESS.md) · [Month5 (September 2026)](README.md)

---

### A Menu Still Speaking the Old Units  🟡 in progress

Week 13 ended with two Betaflight fixes merged, one in the log viewer and one in the firmware. This one is in the part of the firmware a pilot actually touches in the field: the on-screen menu in their goggles, where a wrong number is not a log curiosity but a setting someone changes before a flight.

**What I did**

When a quad loses its radio link, failsafe takes over and, after failsafe_landing_time, lands it. Pilots can set that time from the CLI or from the OSD menu in their goggles.

In #13816 the setting replaced the older failsafe_off_delay and became whole seconds, 0 to 250. The CLI was updated. The OSD menu entry was not: it still described the value as a float in tenths of a second with a ceiling of 200, the format of the setting it replaced. So the default of 60 seconds showed up in the goggles as 6.0, and anything above 200 could not be reached from the menu at all.

The fix is one line: the entry becomes OME_UINT8 with the CLI's own range. The work was making sure that line only changes what is displayed. OME_UINT8 and OME_FLOAT go through the same key handler, which steps the underlying integer by one per press either way, so the stored value and what the firmware does with it are untouched. Only the rendering was ever wrong.

It affects 2025.12.0 onward; 4.5.x predates the change and is fine. Built for STM32F405, F722 and H743 with -Werror, and the cms and failsafe unit tests pass. Approved by both maintainers, haslinghuis and blckmn, the same day it was opened. Waiting on a merge.

```bash
make STM32F405 EXTRA_FLAGS=-Werror
make STM32F7X2 EXTRA_FLAGS=-Werror
make STM32H743 EXTRA_FLAGS=-Werror
make test_cms_unittest test_flight_failsafe_unittest
```

```
OSD menu, failsafe_landing_time = 60 (seconds)
  before:  6.0      <- float, tenths of a second, max 200
  after :  60       <- uint8, whole seconds, 0-250 like the CLI

src/main/cms/cms_menu_failsafe.c  +1 -1

Builds, -Werror:  F405 ok   F722 ok   H743 ok
Unit tests:       cms ok    failsafe ok

Review
  haslinghuis   APPROVED
  blckmn        APPROVED
  coderabbit    APPROVED
  copilot       approval recommended, no findings
```

- [betaflight#15751](https://github.com/betaflight/betaflight/pull/15751)
- [betaflight#13816, where the setting changed units](https://github.com/betaflight/betaflight/pull/13816)
- [betaflight/betaflight](https://github.com/betaflight/betaflight)
- [Week 14 full report](https://josa-openlab.github.io/Ti-progress/reports/week-14.html)

