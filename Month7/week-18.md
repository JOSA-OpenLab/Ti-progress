# Week 18: An Alarm That Could Never Clear

🟡 in progress · deadline 2026-11-04 · 0/1 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-18.html)

[All weeks](../PROGRESS.md) · [Month7 (November 2026)](README.md)

---

### The Menu the CLI Left Behind  🟡 in progress

While fixing the timer menu in Week 17 I noted a runner-up on my shortlist, two lines away in the same file: the goggles ALARMS menu allowed values the CLI had stopped accepting years ago. Two old pull requests had tightened the CLI limits and missed the menu. A pilot could use the menu to set an alarm that a CRSF link can never clear.

**What I did**

The warning fires when the link reading is below the alarm. A CRSF link reports link quality up to 100 and RSSI up to 0 dBm, but the menu let a pilot set 300 and +20, so the warning stays on even at a perfect link. The CLI dropped those limits in #9698 and #11062, and the menu never followed. The fix is two lines that give the menu the CLI limits.

The review changed the fix. haslinghuis asked for a link quality minimum of 0 to match the CLI. Before agreeing, I ran that change from every value the CLI allows, and it exposed a side effect: the menu steps by 5 and does not clamp, so an alarm of 3 set from the CLI wraps to 65534 on one press left, and the warning sticks on. I wrote a clamp and pushed it. haslinghuis then asked why it covered only the 16-bit types and suggested doing it separately. That was fair: it had grown past what the PR was about. I took it out and saved it on a local branch for its own PR.

In Week 17 I wrote that SITL compiles the OSD menus out. This week I turned them back on in throwaway builds, with OSD, menus and CRSF enabled and a few scratch patches that never touch the PR branch. A script played a radio sending CRSF over TCP and goggles over MSP displayport, then pressed through the real menu, saved, rebooted and read the value back. Across 4 builds and 6 scenarios, 24 of 24 results matched my predictions, written before the runs. It is still a simulation. Nothing here has flown, and 2 of 26 launches came up with a blank screen for a reason I did not find.

The PR that remains has a known limit, and I would rather log it than hide it. Until the clamp PR lands, an alarm of 1 to 4 set from the CLI still wraps on one press left, and 98 still steps to 103. MAX DISTANCE already wraps the same way on master today. nerdCopter's review found the same wrap independently and rated it minor, which also tells me the clamp PR should come soon. nerdCopter's review also noted the description had no test notes, so on 10 Nov I reran the SITL scenarios on the PR head and today's master, got the same results, and added a short test note to the description.

haslinghuis and nerdCopter both approved #15932, and it is waiting to merge. The same week, nerdCopter and haslinghuis approved Week 15's #15814 on its current head.

```bash
bash sitlbuild.sh <git-ref> <name>                # throwaway SITL build with OSD, CMS and CRSF on
python3 osd_sim.py master pushedpr min0only fix   # 6 pilot scenarios on each build
```

```
Real firmware in SITL, radio over CRSF, goggles over MSP displayport
Each value saved, rebooted and read back

Scenario                     master   this PR
LINK QUALITY 80, hold RIGHT  300      100
RSSI DBM -60, hold RIGHT     +20      0
Warning at a strong link     stuck    clears

Still open, for the separate clamp PR
LINK QUALITY 3, one LEFT     3        65534
LINK QUALITY 98, one RIGHT   103      103
RSSI DBM -3, one RIGHT       +2       +2
MAX DISTANCE 34, four LEFT   65530    65530

src/main/cms/cms_menu_osd.c  +2 -2
CI on the final commit       55 passed, 1 skipped
Predictions matched          24 of 24, across 4 builds

Status
  betaflight#15932  OPEN, approved by haslinghuis and nerdCopter
  betaflight#15814  OPEN, approved by haslinghuis and nerdCopter
```

- [betaflight#15932](https://github.com/betaflight/betaflight/pull/15932)
- [betaflight#9698, CLI link quality limit](https://github.com/betaflight/betaflight/pull/9698)
- [betaflight#11062, CLI RSSI dBm limit](https://github.com/betaflight/betaflight/pull/11062)
- [Week 18 full report](https://josa-openlab.github.io/Ti-progress/reports/week-18.html)

