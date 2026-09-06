# Week 10: Project Research & Ideation

✅ done · deadline 2026-08-11 · 1/1 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-10.html)

[All weeks](../PROGRESS.md) · [Month4 (August 2026)](README.md)

---

### Pick a Project, Write a Contribution Proposal  ✅ done

Land on a real, active OSS project (>=1,000 stars, active in the last 90 days, a domain I actually want to learn) and write a proposal: the project, why me/why this, specific issues or RFCs to target, 12-week milestones, risks, and mentorship needed for the next 3 months.

**What I did**

Betaflight. I'm building my own quad right now (Nano flight controller, NRF24 remote) and already had to debug an IMU sign issue on my own MPU6050, so this is the same problem at real scale instead of toy scale. Everything else this apprenticeship was Swift, Python, Rust; this is bare metal C and real-time control, the part of robotics I actually want to get good at. My target was #15526, a yaw sign flipped when someone merged two trig calls into one (PR #14790): cos didn't care since it's even, sin did.

Then the target disappeared. While I was preparing, another contributor's PR #15555 fixed #15526 and merged on 5 September, and it went further than the issue asked, catching a second bug where the computed quaternion products were immediately overwritten. Rather than duplicate approved work I re-audited what was actually open, and that turned out to be the more useful lesson: verify against master before you commit to a plan, because five of the issues on my shortlist had been closed or already had pull requests against them.

What I contributed instead was verification, which is the scarce thing on this project. Trying to build the SITL target inside Docker on my Apple Silicon Mac, the build died at parse time: mk/tools.mk defines the ARM toolchain URL for linux-x86_64, macosx-x86_64, macosx-arm64 and windows, and hard-errors on anything else, so linux-aarch64 is unsupported. Because that error is evaluated at parse time it also blocks TARGET=SITL, which needs no cross toolchain at all. A three-line fix for it was already open as PR #15642, approved by two maintainers but sitting unmerged for over a week with nobody able to confirm it. I reproduced the failure, applied the patch, confirmed it builds, and posted that.

The bigger find is a maintainer's own SITL harness at src/test/sitl/sitl_harness.py: 1,632 lines and 19 flight scenarios that boot the real firmware and fly it over UDP. It is referenced nowhere else in the repo, so it only runs when its author types the command. Betaflight's CI compiles a SITL binary but never flies it, and the unit tests assert on constants like pt1FilterGain(100.0f, 31.25f) == 0.999949, which is why a yaw sign inversion survived six months of green CI. I ran the harness in three environments to see whether it could live in CI: 14/19 on macOS in 954s, 4/19 in a Docker container (too jittery to be a fair control, so I threw that result out), and 15/19 in 1073s on a stock GitHub ubuntu-latest runner. Three scenarios fail on both macOS and Linux, so those are candidates for real issues rather than environment noise, and 18 minutes is the real obstacle to running this per pull request. That is my project for the coming weeks.

```bash
make TARGET=SITL
python3 src/test/sitl/sitl_harness.py --binary obj/main/betaflight_SITL.elf --binary-b /tmp/B.elf --scenario all
```

```
macOS 26        : 14/19 passed,  954s
ubuntu-latest   : 15/19 passed, 1073s
failing on both : mission_flight, rescue, rescue_switch_descent

Contributed: reproduction + build confirmation on PR #15642 (linux-aarch64 toolchain),
approved by two maintainers and unmerged for 8 days before the report.
```

- [betaflight/betaflight](https://github.com/betaflight/betaflight)
- [#15526 (original target, fixed by someone else)](https://github.com/betaflight/betaflight/issues/15526)
- [My verification comment on PR #15642](https://github.com/betaflight/betaflight/pull/15642#issuecomment-5557968883)
- [Week 10 full report](https://josa-openlab.github.io/Ti-progress/reports/week-10.html)

