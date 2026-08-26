# Week 04: Code Review & the Maintainer Mindset

✅ done · deadline 2026-06-06 · 5/5 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-04.html)

[All weeks](../README.md) · [June 2026](README.md)

---

### Two Real Reviews  ✅ done

Leave verify-before-asserting reviews on three real open PRs, cloning and smoke-testing every claim before posting it.

| Reviews | False claims killed |
|---|---|
| 3 | 3 |

**What I did**

Left substantive design/correctness reviews on three open PRs using Conventional Comments labels, two on Excalidraw (#11510 and #11514, the competing fixes for the same invalid-hex-color issue #9527) and one on Cal.com (#29603, enforcing booking limits across a recurring series). The rule I held to was verify-before-asserting: for every claim I cloned the repo, read the actual source, and ran an isolated smoke test before posting. That paid off most on Cal.com, where two tempting 'bugs' both turned out to be false, a 401 status 'regression' that the existing method already does, and a 'dropped' includeManagedEvents arg that the regular path also omits. Per Google's guide those are pre-existing/consistent behavior and belong in a separate issue, not the CL, so I dropped them. On Excalidraw a 'does it accept color names?' question I almost posted was killed by a tinycolor smoke test (it does), which would have made me look like I hadn't read the lib. Each review paired a real note with genuine praise and a clearly-labelled non-blocking tag, and I asked 'is there a reason X?' rather than asserting wherever I wasn't certain.

```bash
gh pr diff 11510 --repo excalidraw/excalidraw   # read the change before judging it
git clone --depth 1 excalidraw && gh pr checkout 11510   # verify claims against real source
node -e 'tinycolor("red").isValid()'   # smoke test: normalizeInputColor DOES accept named colors -> dropped a wrong comment
gh pr review 11510 --repo excalidraw/excalidraw --comment --body '...'   # a11y suggestion + useMemo nit + praise
gh pr review 11514 --repo excalidraw/excalidraw --comment --body '...'   # msg-accuracy + test-gap + praise
gh api .../checkBookingLimits.ts?ref=$HEAD   # confirmed 401-wrap is pre-existing, not a regression
gh pr review 29603 --repo calcom/cal.com --comment --body '...'   # duplication Q + reschedule Q + praise
```

```
3 reviews posted as Ti-03 (all type COMMENTED, non-blocking):

1. excalidraw/excalidraw#11510 (minimal invalid-hex fix)
   suggestion: error text is title-only (hover/SR-inconsistent) + color-only cue; add a visible msg + aria-describedby
   nit:        useMemo over a one-line ternary is needless ceremony
   praise:     empty-input guard (value.trim().length > 0) + clears on blur

2. excalidraw/excalidraw#11514 (thorough invalid-hex fix, same issue #9527)
   suggestion: message 'Use a format like #RRGGBB' is narrower than what tinycolor accepts (#fff, named, rgb/hsl)
   suggestion: the value === '' branch is new logic with no test
   praise:     correct a11y pattern (aria-invalid + aria-describedby + role=alert) and tests beyond the happy path

3. calcom/cal.com#29603 (recurring-booking limit enforcement)
   question:   _checkBookingLimitsForRecurringBooking near-duplicates _checkBookingLimits (verbatim catch), fold in?
   question:   recurring reschedule + offset (requestedInPeriod - 1), can a no-op reschedule be over-counted?
   praise:     atomic up-front validation; test asserts bookingCount === 0 for the PENDING bypass case

Killed before posting (verified false): 401 'regression' (pre-existing), dropped includeManagedEvents (regular path omits it too), 'accepts color names?' (smoke test: it does).
```

- [excalidraw: invalid-hex (minimal)](https://github.com/excalidraw/excalidraw/pull/11510)
- [excalidraw: invalid-hex (thorough)](https://github.com/excalidraw/excalidraw/pull/11514)
- [cal.com: recurring booking limits](https://github.com/calcom/cal.com/pull/29603)
- [Week 04 full report](https://josa-openlab.github.io/Ti-progress/reports/week-04.html)

### Self-Review Write-up  ✅ done

Self-review my own 4,461-line 'Dev' PR as a hostile stranger, name the payment bug I shipped, then walk back my own overstatement once I traced the code.

| Lines reviewed | Real bug found | Should've been |
|---|---|---|
| 4,461 | 1 | ~5 PRs |

**What I did**

Self-reviewed my own remainders#30, a 4,461-line PR titled just 'Dev' that merged a whole dev branch bundling an admin dashboard, auth, a Ko-fi payment webhook, file uploads and caching. Reviewing it as a hostile stranger surfaced one genuine correctness bug I'd missed at the time: the webhook lowercases the donor email and queries Firestore with it, but signup stores user.email un-normalized, so a case-sensitive equality means already-registered users with any uppercase in their email silently miss their paid Pro grant. The bigger lesson was about asserting carefully even against my own code: my first pass claimed the user 'never gets Pro', but tracing applyPendingKofiGrant proved that's overstated, donate-before-signup is rescued and there's a manual fallback field, so the accurate scope is narrower. I also nearly flagged 'no webhook verification' before reading the handler, which actually does a timing-safe token compare and fails closed. Doing the work the author should have done (self-review before requesting review really does catch ~30%) and writing it up honestly, including correcting my own overstatement, was the point.

```bash
gh pr view 30 --repo Ti-03/remainders --json files   # 33 files / +4461 across ~5 concerns = should have been ~5 PRs
gh api repos/Ti-03/remainders/contents/app/api/webhooks/kofi/route.ts?ref=main   # read the payment path
gh api .../lib/firebase.ts  # saveUserProfile stores email verbatim (line 239)
gh api .../app/dashboard/page.tsx  # caller passes user.email RAW (line 370); applyPendingKofiGrant only at signup (line 47)
# traced end-to-end before asserting: stored-raw vs queried-lowercased + Firestore == is case-sensitive
```

```
Self-review of remainders#30 'Dev' (merged 2026-03-27):

blocking (correctness): webhook lowercases donorEmail + queries where('email','==',donorEmail), but signup stores user.email un-normalized (dashboard:370 -> firebase.ts:239). Firestore == is case-sensitive -> an already-registered user with any uppercase in their email silently misses the auto Pro grant (filed pending_signup; auto-apply only fires at username creation). Fix: lowercase email at signup, as username already is.
blocking (scope): 4,461 lines titled 'Dev' bundling admin route-protection + users page + payment webhook + background uploads + wallpaper caching. Should have been ~5 scoped PRs.
suggestion (security): no replay/idempotency guard; kofi_transaction_id is never checked, so a retried/replayed valid payload resets planExpiresAt to now+30d.
question: each payment overwrites planExpiresAt to now+30d rather than extending, a subscriber paying early loses remaining days. Intended?
praise: webhook security basics are solid, timing-safe token compare + length guard, fail-closed (503) when unconfigured, every event logged, tolerant of Ko-fi content-type quirks.

Verification: dropped 1 false claim (webhook 'no verification'); corrected 1 overstatement (email bug is not 'never gets Pro', donate-before-signup + manual fallback recover it); 3 findings confirmed to specific lines.
```

- [remainders #30 (self-reviewed)](https://github.com/Ti-03/remainders/pull/30)
- [Ti-03/remainders](https://github.com/Ti-03/remainders)
- [Week 04 full report](https://josa-openlab.github.io/Ti-progress/reports/week-04.html)

### Spot the Over-Engineering  ✅ done

Show that vscode#298676 builds an 829-line generic 'foundation' just to ship one folding preference, and that the maintainer made the same YAGNI case.

| Lines | Real callers | Providers using it |
|---|---|---|
| +829 | 1 | 0 |

**What I did**

Analyzed vscode#298676, a PR that builds a generic 'FoldingPreferences foundation' (a public settings API, a FoldingPreferencesCapabilities interface, an abstract generic CompatibilityAdjuster<P> base class, and a compatibility layer) just to deliver ONE folding behavior: include the closing brace line. The over-engineering is verifiable, not opinion: the generic adjuster base has exactly one subclass, every provider ships an empty {} capabilities object so the fancy interface is unused, the code comments 'if multiple adjusters are active' when there's only one, and it even changes the public monaco.d.ts API, 829 lines for a single preference. The clincher is that the folding owner (aeschli) pushed back with the exact YAGNI argument: 'there's no language-agnostic way of describing what you want... the right answer is specific settings per folding provider.' The lesson that stuck: the test for premature abstraction isn't 'is this clean?', it's 'where's the second real caller?', with one preference, one adjuster, and zero providers declaring native support, there isn't one, so the framework is speculative. The simpler version is a single setting on the one provider that needs it; the abstraction only earns its keep once two real preferences share a genuine language-agnostic meaning.

```bash
gh pr view 298676 --repo microsoft/vscode --json title,additions,deletions,changedFiles,body   # +829/-242, 9 files, 1 preference
gh pr diff 298676 --repo microsoft/vscode | grep 'class CompatibilityAdjuster'   # abstract base + exactly ONE subclass
gh pr diff 298676 | grep 'FoldingPreferencesCapabilities = {}'   # every provider's capabilities are empty placeholders
gh pr view 298676 --json comments   # maintainer aeschli: 'the right answer is specific settings per folding provider'
```

```
Over-engineering: vscode#298676 'Introduce FoldingPreferences foundation and includeClosures compatibility layer' (OPEN, +829/-242, 9 files).

WHAT'S PREMATURE:
- CompatibilityAdjuster<P extends keyof EditorFoldingPreferences>: abstract generic base with exactly ONE subclass (CompatibilityAdjusterIncludeClosures).
- FoldingPreferencesCapabilities interface for providers to declare native support -> every provider ships an EMPTY {} (IndentRangeProvider + SyntaxRangeProvider). Zero real capabilities.
- Code comments 'if multiple adjusters are active' -> there is only one.
- New public editor.foldingPreferences API leaks into monaco.d.ts + standaloneEnums.ts -> for a single preference.
- Author's own words: 'only partially implemented and represented by placeholders.'

SIMPLER ALTERNATIVE (per maintainer aeschli, who owns folding): a specific setting on the one folding provider that needs it (e.g. the TS folding strategy). No foundation, no capabilities interface, no compatibility/adjuster layer, no public-API change. ~a handful of lines vs 829.

WHAT WOULD JUSTIFY IT: >=2 real preferences sharing a genuine language-agnostic meaning AND multiple providers natively supporting them. With 1 preference / 1 adjuster / 0 native supporters, the 'two real callers' (YAGNI) test fails -> premature.

Maintainer quote: 'There's no language-agnostic way of describing what you want. Each language is different... the right answer is specific settings per folding provider.'
```

- [vscode #298676 (analyzed)](https://github.com/microsoft/vscode/pull/298676)
- [microsoft/vscode](https://github.com/microsoft/vscode)
- [Week 04 full report](https://josa-openlab.github.io/Ti-progress/reports/week-04.html)

### Read Merged PRs in One Project  ✅ done

Read four merged rust-lang/rust PRs to learn how its review culture turns judgment into explicit bot commands and settles disagreement with evidence.

| PRs read | Project |
|---|---|
| 4 | rust-lang/rust |

**What I did**

Read the discussion on four recently-merged rust-lang/rust PRs (#158042, #158026, #158137, #158122) to learn its review norms. The biggest takeaway is how much of the culture is ritualized into explicit commands and bots so humans only spend attention on judgment: approval isn't a vibe, it's '@bors r+' and nothing merges except through bors' merge queue (the 'not rocket science rule' that keeps main always-green. Performance isn't argued, it's measured, perf-sensitive PRs get '@bors try @rust-timer queue' + an 'S-waiting-on-perf' label before anyone approves. The most instructive human moment was a disagreement on the clipboard PR (#158137): a reviewer doubted the author's 'I couldn't reproduce' claim, but instead of insisting, went and tested across browsers on BrowserStack and publicly updated his position ('I take it back, I wasn't testing the right thing'), disagreement resolved by evidence, not authority, with light banter ('Dark magic.') keeping it human. I also saw a reviewer decline gracefully ('I'm not familiar with this code, feel free to reassign'), admitting expertise limits is normalized, not a loss of face. What gets flagged: perf regressions, commit-message hygiene (a bot nags to move issue links out of commits), and unverified reproduction claims. What slides: style/formatting is delegated to tidy + bots so reviewers don't bikeshed it; reviewers approve when a change clearly improves code health even with open follow-up questions.

```bash
gh search prs --repo rust-lang/rust --merged --json number,title,commentsCount   # find PRs with real discussion
gh pr view 158137 --repo rust-lang/rust --json comments,reviews   # the clipboard PR: disagreement settled by BrowserStack testing
gh pr view 158042 --repo rust-lang/rust --json reviews   # perf: @bors try @rust-timer queue + S-waiting-on-perf before r+
gh pr view 158026 --repo rust-lang/rust   # reviewer: 'not familiar with this code, feel free to reassign' -> @rustbot author
```

```
Review norms observed in rust-lang/rust (4 merged PRs read):

STRUCTURE / GATEKEEPING
- Approval is a command, not a vibe: '@bors r+' (approve+queue), 'r=me', 'r+ rollup' (allow batching). Nothing merges except via the bors merge queue ('not rocket science rule' -> main is always green).
- Reviewer assignment is explicit + tracked: rustbot auto-assigns ('within two weeks or reassign'); 'r? compiler' picks a team. State tracked via labels/commands: @rustbot author (waiting on author), @rustbot ready, S-waiting-on-perf.
- Rollups batch small approved PRs into one CI run for throughput.

WHAT GETS FLAGGED
- Perf: measured, not argued -> '@bors try @rust-timer queue' runs a benchmark before approval (#158042, #158122).
- Commit hygiene: a bot nags to move issue links out of commit messages (avoid spamming issues).
- Unverified claims: a 'couldn't reproduce' was challenged and tested.
- Spurious vs real CI: reviewers triage ('the CI failure is spurious').

WHAT SLIDES
- Formatting/style delegated to tidy + bots -> no human bikeshedding.
- PRs approved when they clearly improve code health even with open follow-up questions ('glad to see this ugly workaround removed').

DISAGREEMENT RESOLUTION (#158137)
- Reviewer doubted author's no-repro claim -> went and tested on BrowserStack across browsers -> publicly reversed ('I take it back, I wasn't testing the right thing'). Evidence > authority, with friendly banter ('Dark magic.').
- Reviewers admit limits without ego: 'I'm not familiar with this code, feel free to reassign.'
```

- [rust #158137 (clipboard, the key thread)](https://github.com/rust-lang/rust/pull/158137)
- [rust-lang/rust](https://github.com/rust-lang/rust)
- [Week 04 full report](https://josa-openlab.github.io/Ti-progress/reports/week-04.html)

### Giving & Receiving Feedback Without Ego  ✅ done

Internalize separating self from work: lead with the code, tag severity so a nit doesn't read as a blocker, and be the first to say 'you're right'.

| Soft skill |
|---|
| Low-ego |

**What I did**

The principle that landed hardest was separating self from work, and I felt it most on my own code: self-reviewing my 4,400-line 'Dev' PR meant reading my past self as a stranger and naming a payment bug I'd shipped, then walking back my own overstated first claim once I traced the code. As a reviewer the discipline was leading with the code not the person, tagging severity so a nit doesn't read as a blocker, and asking 'is there a reason X?' instead of asserting (verifying first killed three confident-but-wrong claims before they ever reached an author). As an author, low-ego meant respecting the reviewer's attention: on palmier-pro I opened an issue first, kept the PR tiny and test-backed, and offered to close it. Receiving feedback is the same muscle pointed inward, which Rust modeled when a reviewer who doubted the author tested on BrowserStack and reversed himself in public. My code is not me, and the fastest way to look good is to be the first to say 'you're right'.

- [Week 04 full report](https://josa-openlab.github.io/Ti-progress/reports/week-04.html)

