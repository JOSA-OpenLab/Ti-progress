# Week 16: Closing a Ticket I Corrected

✅ done · deadline 2026-10-21 · 1/1 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-16.html)

[All weeks](../PROGRESS.md) · [Month6 (October 2026)](README.md)

---

### Dead Code Nobody Could Compile  ✅ done

In September I corrected a maintainer's ticket instead of fixing it, and offered to send the PR. A month later the ticket was about to close as stale. Then the maintainer re-checked it, his result matched my correction, and he left it open for anyone to take. Following through on my own offer was the obvious next contribution.

**What I did**

The firmware turns on each chip peripheral's clock through a table of tags, one set per chip family. One tag, RCC_AHB, and its five macros were left over from older chips that had a single AHB clock register. The original ticket said they would fail to compile on three families. In September I showed they could not compile on any family, because the register name they expand to does not exist on any supported chip. In October the maintainer re-checked it with his own tools and got the same answer.

This time I used several AI models as independent authors and reviewers. Three models each wrote a fix without seeing the others, and all three arrived at the same 11-line deletion: the dead tag, its five macros, and four duplicated defines left behind by a 2023 copy-paste.

The one real risk was that removing a tag renumbers the tags after it on the F4 and H7 chips. Three more reviewers, each on a different model from the author it was checking, built up to 40 targets with and without the change and compared the firmware itself, not just whether it compiled. Eight chip families came out byte-identical. On F4 and H7 every changed byte was exactly that renumbering, with the same code size and the same symbols, and nothing stores or transmits these numbers. 1362 unit tests passed, and the CI-style builds with warnings as errors were clean.

Three maintainers approved it and haslinghuis merged it two days after I opened it. It carries the RN: IGNORE label, which only means it is left out of the release notes: deleting dead code changes nothing a pilot can see.

```bash
make STM32F405 STM32F722 STM32G474 STM32H743 APM32F405 AT32F435G EXTRA_FLAGS=-Werror
make checks
make test
python3 cmp.py base/ patched/   # per-target firmware comparison, build stamps pinned
```

```
src/platform/common/stm32/platform/rcc.h  11 deletions, 0 additions

Firmware, base vs patched (up to 40 targets per reviewer)
  F7, G4, H5, C5, N6, AT32, APM32, X32   byte-identical
  F4, H7   same size, same symbols; every changed byte = tag renumbering (-32, switch -1)

Unit tests   1362 passed
-Werror      6 families, 0 warnings
make checks  ok

Review
  blckmn, haslinghuis, betaflight-admin   APPROVED
  56/56 CI checks passed
  MERGED 2026-10-12 17:22 UTC by haslinghuis
```

- [betaflight#15820 (MERGED)](https://github.com/betaflight/betaflight/pull/15820)
- [betaflight#15560, the ticket I corrected in September](https://github.com/betaflight/betaflight/issues/15560)
- [betaflight/betaflight](https://github.com/betaflight/betaflight)
- [Week 16 full report](https://josa-openlab.github.io/Ti-progress/reports/week-16.html)

