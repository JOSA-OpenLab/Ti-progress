# Week 12: Proving It Without the Hardware

✅ done · deadline 2026-09-17 · 3/3 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-12.html)

[All weeks](../PROGRESS.md) · [Month5 (September 2026)](README.md)

---

### A Bug the Radio Never Admitted  ✅ done

Week 11 ended with one fix merged and the habit that produced it: read the source, prove the claim, do not trust the issue tracker. This week was about pointing that at a part of the stack nobody audits, the Lua scripts that run on the pilot's radio transmitter, and about answering the question I could not answer before: how do you prove a fix when the hardware is a physical radio you do not own?

**What I did**

These scripts let a pilot tune a quad from the radio instead of a laptop. The Receiver page reads the RC Smoothing on/off setting from byte 25 of an MSP message. Since firmware API 1.44 the flight controller writes a hardcoded zero into that byte and discards it again on write; the real setting lives at byte 32. The labels were inverted on top of that, because the underlying value uses an OFF/ON lookup where zero means off.

So on every Betaflight 4.3 and newer quad, since 2021, the radio showed the wrong state, and toggling it and saving was a silent no-op that reverted on the next read. Two lines.

The interesting part was proof. My first instinct was to count bytes in the firmware's C source, and my first count was wrong: I took both branches of every `#ifdef` and `#else`, which inflated every offset after the first conditional. Redoing it properly put the setting at byte 32, and the check that convinced me was not my own arithmetic but the file itself: six other fields on that same page, stick endpoints, camera angle, cutoffs, all land exactly where my corrected layout predicts. Only the one field misses.

Then I stopped counting and asked the firmware. Betaflight has a SITL target that compiles the real firmware as a program you can run on a laptop, and it speaks real MSP over TCP. So I ran it, read the message, and did what the save path does: change one byte, write it back, read it again, see which bytes the flight controller actually kept. Writing byte 25 changed nothing. Writing byte 32 changed the setting. That is not an argument about C, it is the firmware answering for itself.

The last gap was the radio. EdgeTX, the radio firmware, publishes a WebAssembly build that runs the real thing in a browser. Uploading the scripts to it and driving the menus showed the bug as a pilot sees it: a toggle reading OFF against a flight controller that has the setting ON, and a save that reverts. One nuance only the simulator could have revealed, which changed what I wrote in the pull request: on colour radios the field renders as a toggle from the raw value, so the inverted labels never show there. The label half of the bug is only visible on the older monochrome radios.

```bash
obj/main/betaflight_SITL.elf   # real firmware, MSP on TCP 5761
python3 msp_prove.py           # read, mutate one byte, write back, re-read
```

```
TEST 1  byte 25, the byte the radio's script writes
  wrote byte 25: 0 -> 1
  bytes that actually changed in the FC: NONE
  firmware kept it?  NO  (discarded)

TEST 2  byte 32, the byte the fix writes
  wrote byte 32: 1 -> 0
  bytes that actually changed in the FC: [32]
  firmware kept it?  YES

And through the real Lua, with real firmware payloads:
  master: rc_smoothing=0 -> radio shows ON   (wrong)
  fixed : rc_smoothing=0 -> radio shows OFF  (correct)
```

- [betaflight-tx-lua-scripts#548](https://github.com/betaflight/betaflight-tx-lua-scripts/pull/548)
- [betaflight/betaflight-tx-lua-scripts](https://github.com/betaflight/betaflight-tx-lua-scripts)
- [Week 12 full report](https://josa-openlab.github.io/Ti-progress/reports/week-12.html)

### A Memory-Safety Fix, Merged  ✅ done

Betaflight is a good home but a narrow one. The goal here was to find something in a project with a different shape and a much larger audience, and to find it the same way: by reading code, not by shopping an issue tracker.

**What I did**

colibri runs very large mixture-of-experts language models on ordinary hardware, in plain C with no dependencies, by streaming expert weights off disk. It went from nothing to 33,519 stars in about three months, which is exactly the combination worth searching: enormous attention, a young codebase, performance-critical C.

Its server reads exactly the number of bytes a client advertises into a buffer of that size, then hands them to the tokenizer as prompt text. Nothing in between checks the bytes are valid UTF-8. If the prompt ends halfway through a character, a clipped emoji, a cut-off Arabic letter, the decoder still reports that character's full length even though the remaining bytes were never sent. The tokenizer then walks past the end of the buffer.

Without a sanitizer it does not crash. It reads whatever happens to sit next in memory, turns it into tokens, and feeds the model a prompt containing bytes the user never sent, with no sign anything went wrong.

What made this straightforward to argue was that the project had already solved it. The same engine exists twice, and the other copy carries the bounds check, plus a test gating exactly this case under the maintainer's own comment about byte-counted payloads ending mid-character. So the pull request was not 'I think you have a bug', it was 'your own test fails against your other engine'. The fix is that copy, ported verbatim: six lines.

I proved it with AddressSanitizer against untouched master, which reported the out-of-bounds read with file and line numbers, and then showed it was safe with a differential harness over twenty categories of text, ASCII through CJK and emoji and URLs, producing byte-identical output before and after. Merged into dev in under 48 hours with no changes requested.

One process detail worth keeping. The commit was about to go out under my university email address, which is not verified on my GitHub account, so the commit would have landed showing an unlinked author and counted for nothing. Caught it by comparing against the address on an earlier merged commit. Git configuration is per-clone, and it can quietly cost you the credit for your own work.

```bash
clang -fsanitize=address,undefined probe.c -o probe && ./probe
make -C c check
```

```
UNPATCHED (pristine master)
  ERROR: AddressSanitizer: stack-buffer-overflow
  READ of size 1
      #0 utf8_decode qwen36.c:153
      #1 pretok_end  qwen36.c:206

PATCHED
  utf8_decode -> 0xe2   (sibling engine requires 0xe2)
  adv         -> 1      (sibling engine requires 1)
  pretok_end  -> 1      (sibling engine requires 1)
  VERDICT: PASS

make check: 921 tests, exit 0, both trees
```

- [colibri#1557 (MERGED)](https://github.com/JustVugg/colibri/pull/1557)
- [3b459d07 on dev](https://github.com/JustVugg/colibri/commit/3b459d079048)
- [JustVugg/colibri](https://github.com/JustVugg/colibri)

### Measuring Where a Contribution Is Worth Sending  ✅ done

Star count says nothing about whether a project will take your work. Before spending days on a fix I wanted a number for how often each candidate actually merges code from people who are not on the team, and how long it takes them.

**What I did**

I measured four candidates and got the answer badly wrong the first time. My method was GitHub's `author_association` field, which labels a pull request's author as a member, an owner, or a contributor. On that basis one project looked extraordinary: ninety-four of ninety-four merged pull requests from outside contributors, merging in a median of one hour.

That statistic is false. `author_association` reports everyone as a plain contributor when an organisation hides its membership list, and this one does. Counting properly, by whether the branch lived in the repository itself or in a fork, eighty-six of those ninety-four were two employees merging their own branches. Real outside contributions: eight. Across the project's entire history, not one pull request from a fork has ever received a written review.

The corrected numbers reordered everything, including the project I had already recommended. The honest measure is what fraction of merges come from forks: colibri 49 percent, VoiceStudio 29, PX4 25, and the one that looked perfect, 9.

The lesson is not about that project. It is that I presented a number before I understood what it measured, and the number happened to flatter the conclusion I was already leaning toward. The fix is the same discipline as everywhere else this month: find a second, independent way to measure the same thing, and see whether the two agree.

With that settled I sent a deliberately small fix to PX4, the drone autopilot next door to Betaflight. A u-blox GPS parameter declares six configuration bits, so its range is 0 to 63, but it advertises a maximum of 32, the value of the top bit alone. One line. My first draft claimed it blocked a valid configuration; checking showed PX4 never compiles parameter ranges into the firmware at all, so nothing is blocked and the effect is a wrong bound shown to operators. The pull request says that, not the louder version. PX4 also requires that any AI assistance be disclosed in the commit, and states plainly that 'the AI wrote it' is never an acceptable answer in review, which is the right bar and one I want to be held to.

```bash
gh api 'repos/OWNER/REPO/pulls?state=closed&per_page=100'
# classify by head.repo.full_name != base repo, not by author_association
```

```
Share of merged PRs that came from a fork:

  colibri                49%
  VoiceStudio            29%
  PX4-Autopilot          25%
  the one that looked perfect     9%   <-- reported as 100% by author_association

PX4 metadata proof, two generated files of 40,032 lines each:
  line 22021:  <max>32</max>  ->  <max>63</max>
  every other line identical
```

- [PX4-Autopilot#28716](https://github.com/PX4/PX4-Autopilot/pull/28716)
- [PX4/PX4-Autopilot](https://github.com/PX4/PX4-Autopilot)
- [Week 12 full report](https://josa-openlab.github.io/Ti-progress/reports/week-12.html)

