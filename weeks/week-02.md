# Week 02: PR Etiquette & Maintainer Friendly Contributions

✅ done · deadline 2026-05-23 · 3/3 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-02.html)

---

### Two Well-Formed PRs  ✅ done

Land two maintainer-friendly PRs (Arabic tldr translations) that are small, single-purpose, and answer What / Why / How / Test before anyone has to ask.

| PRs | Status | Pages |
|---|---|---|
| 2 | Merged | echo, cp |

**What I did**

Contributed two Arabic translations to tldr-pages/tldr — echo.md and cp.md — both submitted as separate PRs. Before writing anything, I verified the files didn't exist in pages.ar/common/ using the GitHub API directly (404 check), not just a search. I also read CONTRIBUTING.md and the style guide, compared against merged Arabic pages like git.md and docker.md, and used the official translation templates for phrases like انظر أيضًا. The main lesson: a maintainer-friendly PR is small, one logical change, and has a description that answers What/Why/How/Test before anyone has to ask. Keeping technical terms in English (terminal, headers, proxy) instead of forcing formal Arabic translations made the output feel natural rather than machine-generated.

- [docs(ar/echo): Arabic translation](https://github.com/tldr-pages/tldr/pull/22564)
- [docs(ar/cp): Arabic translation](https://github.com/tldr-pages/tldr/pull/22565)
- [tldr-pages/tldr](https://github.com/tldr-pages/tldr)
- [Week 02 full report](https://josa-openlab.github.io/Ti-progress/reports/week-02.html)

### Practice Review  ✅ done

Give a structured review on a real PR, separating what is required to fix from what is a preference using Conventional Comments labels.

| Issues found | Repo |
|---|---|
| 2 | tldr |

**What I did**

Reviewed PR #22625 in tldr-pages/tldr — a new page for the foremost command. Reading the diff carefully, I found two issues: a hardcoded value that should have been a placeholder, and a description that contradicted its own generic placeholder. The main lesson: good review comments separate what is required to fix from what is a preference. Using Conventional Comments labels (nitpick, suggestion) made it clear which comment was blocking and which was optional — so the author doesn't have to guess.

```
nitpick: `-s 100` → should be `-s {{100}}` per style guide
suggestion: description says "JPEG files" but placeholder `{{jpg}}` is generic — rephrase to match
```

- [Review: foremost command page](https://github.com/tldr-pages/tldr/pull/22625#pullrequestreview-4391543152)
- [Week 02 full report](https://josa-openlab.github.io/Ti-progress/reports/week-02.html)

### Asking Good Questions  ✅ done

Learn to ask questions that respect a maintainer's time: show what you already tried, narrow the unknown, and make it easy to answer.

| Soft skill |
|---|
| Q&A |

- [Week 02 full report](https://josa-openlab.github.io/Ti-progress/reports/week-02.html)

