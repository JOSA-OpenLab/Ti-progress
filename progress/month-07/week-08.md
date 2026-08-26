# Week 08: Performance, Profiling & Debugging

✅ done · deadline 2026-07-04 · 5/5 tasks

[Full report on the site](https://josa-openlab.github.io/Ti-progress/reports/week-08.html)

[All weeks](../README.md) · [July 2026](README.md)

---

### Profile and Fix (Voxa + ESLint)  ✅ done

Profile a real workflow, find the bottleneck with data, fix it, and document the before/after. Subject: Voxa's server test suite (the week's brief explicitly allows 'any of your own slow code'), 1180 tests.

**What I did**

Hypothesis first, per the soft skill: I assumed the suite was CPU-bound in the websocket/audio paths. The first measurement killed that: 33s wall but only ~40% CPU, so the suite was mostly WAITING. pytest --durations then showed the top 25 tests (2% of 1181) held ~22s of the 33s. Two wait sinks, both proven with a debugger rather than guessed: (1) every /ws test's first connection ran REAL terminal discovery, osascript Apple Events to iTerm and Terminal.app plus tmux shell-outs, ~3.3s cold, and a TTL cache hid it from every later test, which is why it masqueraded as one 'slow test' (a red herring I initially chased as a voice-param bug); (2) six interrupt tests slept through the real 2x0.7s anti-double-esc retry gap, 7s total. Fixes: an autouse fixture stubbing discovery in test_app.py (one helper in the file already did this locally, so the pattern was endorsed), and the 0.7s gap extracted to a class attribute (_interrupt_gap, production default unchanged) that the six tests set to 0. Result: 33-36s -> 23.7s, ~30% faster, 1180/1180 still green, zero production behavior change. Remaining lead journaled honestly: two hook tests cost ~3.1s in a full run but 0.8s in isolation, a cross-test contention effect not yet diagnosed. Work is committed locally on branch perf/faster-test-suite (not pushed, per this week's instruction). REDO ADDENDUM (the task headline says someone else's repo, so the Voxa work covers only the suggested-repos fallback): I profiled ESLint 9 with eslint-config-next on this site's repo, a third-party tool from my real workflow. The finding is better than a slow function: eslint-plugin-react-hooks v7 (the compiler-based one) is the single largest CPU consumer of the whole lint run, 0.88s of 2.85s sampled (30.7%), more than @babel and typescript-eslint, while ESLint's own TIMING=all attributes under 1ms to all react-hooks rules combined, because the compiler analysis runs outside per-rule instrumentation. So the one built-in diagnostic actively hides the biggest cost. Two more wrong hypotheses for the humility journal: 'a misconfigured rule is the cost' (all rules together: ~2ms) and 'the NODE_ENV development-build selection is the cost' (measured: ~3%). The duplicate search (which failed via the API earlier and finally worked via web search) turned out to matter: facebook/react#35395 already reports the plugin dominating lint time, with maintainers engaged and a perf fix shipped. Filing a new issue would have been noise, so the findings went where they are useful: a comment on #35395 with the small-repo numbers and the one angle the original lacked, that on 7.1.1 the cost no longer appears in TIMING at all, making it undiagnosable with ESLint's own tool.

```bash
time .venv/bin/python -m pytest tests -q        # 33-36s, ~40% CPU: the suite is waiting
.venv/bin/python -m pytest tests -q --durations=25
.venv/bin/python -m cProfile -o test.prof -m pytest tests/test_app.py::test_voice_param_reaches_factory
time .venv/bin/python -m pytest tests -q        # after: 23.7s, 1180 passed
TIMING=all npx eslint .                       # all rules ~2ms; wall 1.65s
node --cpu-prof node_modules/eslint/bin/eslint.js .
# profile: eslint-plugin-react-hooks 0.88s/2.85s = 30.7%, TIMING shows <1ms
```

```
Voxa suite 33-36s -> 23.7s (PR Ti-03/voxa#2). External half: react-hooks v7 = 30.7% of lint CPU, invisible to TIMING on 7.1.1; dup-search found facebook/react#35395, posted corroborating data comment there instead of a duplicate issue.
```

- [facebook/react#35395 (my comment)](https://github.com/facebook/react/issues/35395)
- [py-spy](https://github.com/benfred/py-spy)
- [Voxa (public repo)](https://github.com/voxa-code/voxa)
- [Week 08 full report](https://josa-openlab.github.io/Ti-progress/reports/week-08.html)

### Find an N+1 Query (Bonus)  ✅ done

Pick an open-source web app, turn on SQL logging, and browse around looking for a page issuing N+1 queries. If I find one: open an issue with the query log as evidence, and a PR if the fix is a small eager load or JOIN. If I don't find one, note it in the journal and move on.

**What I did**

Skipped, deliberately. The brief marks this one as a bonus and explicitly allows noting it and moving on ('N+1s aren't always easy to spot from the outside, and not every app you pick will have one... that's fine, note it in your journal and move on'). The journal note, honestly: no hunt was attempted this week, so there is no finding to report and no pretend attempt either. If it ever gets picked up, the designated hunting ground is the WordPress site I run locally under DDEV with the Query Monitor plugin as the SQL log, since WordPress metadata loading is famously N+1-shaped; the tell is the same query shape repeating dozens of times with only the id changing.

```
Bonus task, skipped per the brief's own allowance; journal note recorded, plan on file if revisited.
```

- [Week 08 full report](https://josa-openlab.github.io/Ti-progress/reports/week-08.html)

### Read 3 Real Flame Graphs  ✅ done

Find any 3 flame graphs published online and write in my journal, in my own words, what each one says: what's hot, and what the bottleneck is.

**What I did**

I pulled three published flame graphs from brendangregg.com and read them from the SVG data itself (frame names, sample counts, widths). (1) Linux TCP send: one tower stays ~99.8% wide from vfs_write through tcp_sendmsg, narrowing only gently through tcp_write_xmit (92.7%) to dev_queue_xmit (80.7%). No hot leaf to optimize; the cost is smeared along the whole network stack, so the lever is fewer, bigger sends, not a faster function. (2) MySQL: dispatch_command (98%) funnels to JOIN::exec (78.3%), which splits into two towers: row fetching via InnoDB reverse index reads (~45.6% under do_select) and create_sort_index/filesort at 31.2%. A third of all CPU is sorting rows the index did not deliver in order; the fix lives in the query or index, not in mysqld's code. (3) bash running a while loop: execute_builtin_or_function is 44.7%, but do_redirections (24.9%) plus word expansion (20.6%) together match it: the shell spends as much time setting up redirections and expanding words per iteration as doing the work, the classic cost of a redirect inside a tight loop. Also 15.1% of samples are [unknown]: missing symbols, the real-world annoyance the zines warn about.

```
3 graphs read from raw SVG frame data: Linux tcpsend (no hot leaf, cost smeared along the stack), MySQL (filesort tower = 31% CPU), bash while-loop (redirection+expansion overhead rivals the builtins).
```

- [brendangregg.com](https://www.brendangregg.com/flamegraphs.html)
- [Week 08 full report](https://josa-openlab.github.io/Ti-progress/reports/week-08.html)

### Use a Real Debugger  ✅ done

Pick a debugger for my primary language (pdb, Chrome DevTools, dlv, lldb) and solve one bug end-to-end with breakpoints. No print statements. Document the experience.

**What I did**

One bug end to end in pdb, zero prints. The bug: test_voice_param_reaches_factory took 3.34s while its nearly identical account twin took 0.2s. Session: pytest --trace, breakpoint at the wait call (b tests/test_app.py:120), c to hit it, stamp t0 via pdb statement execution, n to step OVER the wait (3s elapse inside one step), p captured showed the dict still EMPTY after the poll gave up, then faulthandler.dump_traceback() from the pdb prompt dumped every thread mid-hang: two worker threads sat in subprocess.run inside discover_claude_sessions, one in _tty_of_tmux_panes (tmux) and one in discover_iterm (osascript Apple Events), while the event loop idled in select. That single dump rewrote the diagnosis: the test was never slow because of the voice param; it was the FIRST websocket connection of the run paying real terminal discovery, cached for everyone after. Confirmed by running the account twin alone: 3.77s. pdb plus a thread dump beat everything print statements could have told me, because the delay lived on threads my prints would never have run on.

```bash
printf 'b tests/test_app.py:120\nc\n...' | .venv/bin/python -m pytest tests/test_app.py::test_voice_param_reaches_factory -q --trace
(Pdb) n                      # step over the wait: 3s pass
(Pdb) p captured             # {} after 300 polls: value never arrived
(Pdb) !import faulthandler; faulthandler.dump_traceback()   # all threads, mid-hang
```

```
Diagnosed the 3.3s 'slow test' live in pdb: thread dump caught discover_claude_sessions running real osascript/tmux subprocesses; voice-param theory refuted, first-connection cold cost proven.
```

- [rr record-replay debugger](https://rr-project.org)
- [Week 08 full report](https://josa-openlab.github.io/Ti-progress/reports/week-08.html)

### Soft Skill: Intellectual Humility  ✅ done

Performance work is humbling and intuition is usually wrong. Practice: state a hypothesis before measuring, say it out loud when the data proves me wrong, and keep a wrong-predictions journal to spot where my gut systematically fails.

**What I did**

Three logged predictions this week, two wrong. Predicted the Voxa suite was CPU-bound: it was 60% waiting. Predicted the slow test was voice-param-specific: the account twin alone took 3.77s, the cost was first-connection terminal discovery and a TTL cache had been assigning the blame to whoever connected first. Predicted the fix would make everything under 1s: two hook tests still cost 3.1s in a full run but 0.8s alone, and I do not yet know why; that stays in the journal as an open wrong-prediction instead of a hand-wave. The habit that did the work was stating the hypothesis before measuring and letting the tooling vote: durations first, then cProfile, then the pdb thread dump that overturned the story I had already half-written.

```
Wrong-predictions journal: CPU-bound (wrong, 60% waits), voice-param bug (wrong, cold discovery + cache), all-tests-fast-after-fix (wrong, 3.1s contention effect still open).
```

- [Systems Performance, Brendan Gregg](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)
- [Week 08 full report](https://josa-openlab.github.io/Ti-progress/reports/week-08.html)

