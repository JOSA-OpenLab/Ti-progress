# Week 06: Documentation as Code & Technical Writing

✅ done · deadline 2026-06-20 · 5/5 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-06.html)

[All weeks](../README.md) · [June 2026](README.md)

---

### Ship One Real Docs PR  ✅ done

Submit a PR to a major docs project (MDN, GitHub Docs, tldr-pages, or any tool whose README is weak). It can be small, but every line must follow a real style guide: active voice, present tense, second person ("you"), sentence-case headings, short sentences, and no "simply" / "just" / "easy".

**What I did**

I answered an open page request (#23039) for Apple's new container CLI with a new pages/osx/container.md. The interesting work was not the writing, it was the verification: every flag came from Apple's own command-reference.md instead of memory, which caught a real trap. The tool looks like Docker but its Swift ArgumentParser CLI cannot group short flags, so the idiomatic docker -it becomes -i -t here. tldr's style guide did the rest: max 8 examples, option placeholders like {{[-d|--detach]}} so clients can render short or long form, snake_case placeholders, and one user goal per example. I claimed the issue with a comment first so nobody duplicates the work, linted with the same tldr-lint their CI runs, and opened the PR against a freshly synced main.

```bash
gh issue view 23039 --repo tldr-pages/tldr
git fetch upstream main && git merge --ff-only upstream/main
npx tldr-lint pages/osx/container.md
gh pr create --repo tldr-pages/tldr --head Ti-03:container-add-page --title "container: add page"
```

```
PR #23074 open against tldr-pages/tldr: pages/osx/container.md with 8 verified examples for Apple's container v1.0.0. tldr-lint clean, CLA green, codespell green.
```

- [tldr-pages/tldr PR #23074](https://github.com/tldr-pages/tldr/pull/23074)
- [Page request #23039](https://github.com/tldr-pages/tldr/issues/23039)
- [Week 06 full report](https://josa-openlab.github.io/Ti-progress/reports/week-06.html)

### Set Up a Docs Site (MkDocs Material)  ✅ done

Stand up a docs-as-code site for one of my repos with MkDocs Material, deploy it via GitHub Pages or Cloudflare Pages, and link it from the README. It must cover three of the four Diátaxis modes, at least one tutorial, one how-to guide, and reference docs, each kept ruthlessly separate.

**What I did**

MacDirStat already had a GitHub Pages landing page at ti-03.github.io/MacDirStat, served by the legacy Jekyll build from docs/. Rather than replace it, I switched the repo's Pages source to an Actions-based build and wrote a workflow that assembles both outputs into one artifact: the existing landing page stays at the site root, and the new MkDocs Material site lands at /guide/. Content is genuinely three Diátaxis modes, not just labeled that way: a tutorial (scan your first folder), a how-to guide (read the treemap's colors and change the color scheme), and reference docs for ByteFormatter and TreemapLayout written directly from their source, including the actual color-category table and the exact arc-angle formula. I built the site locally with mkdocs build --strict first and simulated the artifact-assembly step by hand before trusting it to CI.

```bash
pip install mkdocs-material
mkdocs build --strict
gh api -X PUT repos/Ti-03/MacDirStat/pages -f build_type=workflow
gh pr create --repo Ti-03/MacDirStat --base main --head docs/mkdocs-adr-vale
```

```
PR #9 open against Ti-03/MacDirStat: guide/ (index, tutorial, how-to, 2 reference pages) + mkdocs.yml + .github/workflows/pages.yml. Local strict build clean, artifact assembly verified by hand (landing page at /, docs at /guide/).
```

- [MacDirStat PR #9](https://github.com/Ti-03/MacDirStat/pull/9)
- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
- [Diátaxis framework](https://diataxis.fr)
- [Week 06 full report](https://josa-openlab.github.io/Ti-progress/reports/week-06.html)

### Write My First ADR  ✅ done

Capture the why behind a real technical decision in one of my projects as an Architecture Decision Record, using Michael Nygard's format (Status / Context / Decision / Consequences). Commit it as docs/adr/0001-....md so the reasoning survives after the decision is forgotten.

**What I did**

I did not invent a decision to document, I had a real one from last week that was still worth writing down. The Week 5 CI matrix caught a bug where GlassCompat.swift's macOS 26 Liquid Glass calls compiled fine locally (only the macOS 26 SDK was installed) but failed on the macos-15 CI runner, because #available is a runtime check and does not stop the compiler from needing a symbol that only exists in a newer SDK. The fix was a compile-time #if compiler(>=6.2) guard wrapped around the existing #available check. Writing it as an ADR forced me to be explicit about the Consequence that actually matters: any future Liquid Glass call site that copies a plain #available pattern from elsewhere in the codebase will silently reintroduce this bug, with no compiler warning to catch it.

```bash
git log -p -- Sources/App/GlassCompat.swift
mkdir -p docs/adr
```

```
docs/adr/0001-compile-time-guard-for-liquid-glass.md committed in PR #9, Nygard format (Status/Context/Decision/Consequences).
```

- [MacDirStat PR #9](https://github.com/Ti-03/MacDirStat/pull/9)
- [0001-compile-time-guard-for-liquid-glass.md](https://github.com/Ti-03/MacDirStat/blob/docs/mkdocs-adr-vale/docs/adr/0001-compile-time-guard-for-liquid-glass.md)
- [adr.github.io](https://adr.github.io)
- [Week 06 full report](https://josa-openlab.github.io/Ti-progress/reports/week-06.html)

### Add Vale to a Repo + CI  ✅ done

Add the Vale prose linter with the Microsoft style to one repo, run it across the docs, and fix what it flags. Then wire it into the same CI pipeline from Week 5 so style violations fail the build, not a reviewer's patience.

**What I did**

I put Vale on MacDirStat, the same repo that already has the MkDocs site, the ADR, and the Week 5 CI matrix, so the whole week lives in one PR. The config uses the Microsoft style, the same voice the docs were already written in, which meant the fixes were real style tightening rather than fighting the linter: spaced em dashes became colons and commas (which also satisfies my own no-em-dash rule), 'do not' became 'don't', and one quote got its period pulled inside. I turned off Vale.Spelling because the reference pages quote real API symbols (ByteFormatter, TreemapLayout), and set MinAlertLevel to error so clear-cut violations fail the build while advisory warnings (like 'use I sparingly' in a first-person ADR) still print but don't block. The styles are downloaded by `vale sync`, not committed, so CI stays reproducible from a clean checkout, which I verified by deleting the local styles dir and re-running the exact CI sequence before opening the change.

```bash
brew install vale
vale sync
vale guide docs/adr README.md
rm -rf .github/styles && vale sync && vale guide docs/adr README.md
```

```
Added .vale.ini (Microsoft style, error gate) and a prose-lint job on ubuntu-latest in the existing ci.yml. Fixed 31 errors + 2 warnings across 7 files (guide, ADR, README). Fresh clean-checkout run: 0 errors, 0 warnings in 7 files. Opened as PR #10 (follow-up to #9, which merged first).
```

- [MacDirStat PR #10](https://github.com/Ti-03/MacDirStat/pull/10)
- [Vale](https://vale.sh)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/)
- [Week 06 full report](https://josa-openlab.github.io/Ti-progress/reports/week-06.html)

### Soft Skill: Empathy for the Reader  ✅ done

Practice reader empathy (theory of mind): name the audience at the top of each page, read my own docs in a private tab as a stranger and fix the first place I get stuck, and watch a friend follow my tutorial with no help, the single highest-leverage move in technical writing.

**What I did**

Name the audience was already paid for by the week's docs work: every guide page opens by saying who it is for (the home names macOS users who have the app, the tutorial names first-time users, the how-to names users who have run a scan, the reference names people reading the Swift source). Read as a stranger caught something real: walking the live guide with no repo context, I got stuck at step zero. Both the guide home and the tutorial's 'Before you start' say you need MacDirStat installed, and neither links to where to get it; a stranger landing on /guide/ from a search has no path to the app. The fix is PR #11, two links: a 'Not installed yet?' pointer on the guide home and an install link in the tutorial prerequisites. Watch someone use the docs did not happen live this week; the fresh-context walkthrough stood in, and the honest note is that it is a weaker signal than a real stranger, it catches dead ends but not sentences that only confuse someone who does not share my head. Scheduling a real usability read is the habit to carry forward.

```
Stranger-read finding fixed in MacDirStat PR #11: docs required an installed app but never linked the download.
```

- [MacDirStat PR #11](https://github.com/Ti-03/MacDirStat/pull/11)
- [Procida — What nobody tells you about documentation](https://www.youtube.com/watch?v=t4vKPhjcMZg)
- [Week 06 full report](https://josa-openlab.github.io/Ti-progress/reports/week-06.html)

