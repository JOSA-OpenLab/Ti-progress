# Week 10: Project Research & Ideation

✅ done · deadline 2026-08-11 · 1/1 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-10.html)

[All weeks](../PROGRESS.md) · [Month4 (August 2026)](README.md)

---

### Pick a Project, Write a Contribution Proposal  ✅ done

Land on a real, active OSS project (>=1,000 stars, active in the last 90 days, a domain I actually want to learn) and write a proposal: the project, why me/why this, specific issues or RFCs to target, 12-week milestones, risks, and mentorship needed for the next 3 months.

**What I did**

Betaflight. I'm building my own quad right now (Nano flight controller, NRF24 remote) and already had to debug an IMU sign issue on my own MPU6050, so this is the same problem at real scale instead of toy scale. Everything else this apprenticeship was Swift, Python, Rust; this is bare metal C and real-time control, the part of robotics I actually want to get good at. Target issue is #15526, a yaw sign flipped when someone merged two trig calls into one (PR #14790): cos didn't care since it's even, sin did. It's already fully diagnosed, so I go straight to fixing it instead of hunting for the cause, plus a small second fix in the same area (sdft.c). Also watching three separate heading-goes-wrong-after-an-update reports (#15507, #15521, #15527) as a possible recurring-problem investigation. Full 12-week plan, risks, and mentorship asks (FPV/drone/robotics people, not generic embedded-C people) are in the report.

```
Contribution proposal drafted for Betaflight; target issue #15526 identified and diagnosed; 12-week plan + risks + mentorship needs written up for the coordinator.
```

- [betaflight/betaflight](https://github.com/betaflight/betaflight)
- [#15526 (target issue)](https://github.com/betaflight/betaflight/issues/15526)
- [Week 10 full report](https://josa-openlab.github.io/Ti-progress/reports/week-10.html)

