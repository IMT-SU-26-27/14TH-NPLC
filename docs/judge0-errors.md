# Judge0 verdicts and errors

Submissions on `/cp` are judged by the self-hosted Judge0 (`JUDGE0_URL`, server-only). The server action sends the code with every test case's input, waits for all results, then compares each output itself. The expected output is never sent to Judge0, and hidden test data never reaches the browser.

Code: `src/lib/judge0/server.ts` (client, status mapping, output comparison), `src/lib/actions/cp.ts` (run / submit), `src/lib/cp/scoring.ts` (efficiency and score).

## Languages

| Language | Judge0 id | Version | Notes |
|---|---|---|---|
| Python | 71 | Python 3.8.1 | Read input with `input()` / `sys.stdin`. |
| C++ | 54 | GCC 9.2.0 | Read with `cin` / `scanf`. |
| Java | 62 | OpenJDK 13.0.1 | The class **must** be `public class Main`, or compilation fails. |

The CPU limit sent to Judge0 is the problem's `time_limit_ms`; the wall-clock limit is 3× that plus 1 s (max 20 s). The memory limit is the problem's `memory_limit_kb` (Judge0 allows at most 512,000 KB).

## How output is compared

Before comparing, both outputs are normalised:

- Windows line endings (`\r\n`) become `\n`.
- Trailing spaces at the end of each line are ignored.
- Trailing blank lines at the end are ignored.

Everything else must match exactly, including spaces inside a line and letter case.

## Verdicts

The submission's verdict is the verdict of the **first** test case that did not pass, or `accepted` when all passed. Each verdict is shown in a toast with the explanation below.

Error toasts have a **View guide** button. It opens the judging results guide (`src/features/cp/components/verdict-guide.tsx`) at that verdict, with its common causes and what to try. The same guide opens from the floating **?** button at the bottom right of every `/cp` page. The text lives in the dictionaries under `cp.verdict.<verdict>` (`title`, `description`, `causes`, `fixes`).

| Judge0 status | Verdict | Why it happens | What the player sees (toast) |
|---|---|---|---|
| 3 Accepted, output matches | `accepted` | The program ran within the limits and printed the expected output. | Accepted: every test passed, with the score. |
| 3 Accepted, output differs | `wrong_answer` | The program ran but printed something else. Common causes: wrong algorithm, missing edge case, extra text such as "Answer:", wrong number formatting. | Wrong answer on test N, with the sample's expected and actual output when N is a sample. |
| 4 Wrong Answer | `wrong_answer` | Not produced by our setup (we don't send expected output), kept for completeness. | Same as above. |
| 5 Time Limit Exceeded | `time_limit_exceeded` | CPU time went over the limit. Usually the algorithm's complexity is too high for the input size (for example O(n²) when n = 10⁵), an infinite loop, or waiting for input that never comes. | Time limit exceeded on test N: use a faster algorithm or check for infinite loops. |
| 6 Compilation Error | `compilation_error` | The code doesn't compile: syntax error, missing include/import, wrong types, or in Java a class not named `Main`. | Compilation error, with the compiler's message. |
| 7 Runtime Error (SIGSEGV) | `runtime_error_sigsegv` | Invalid memory access: array index out of bounds, null/dangling pointer, or stack overflow from deep recursion. | Runtime error (segmentation fault). |
| 8 Runtime Error (SIGXFSZ) | `runtime_error_sigxfsz` | The program wrote more output than allowed (1 MB), often from printing inside a loop by mistake. | Runtime error: output too large. |
| 9 Runtime Error (SIGFPE) | `runtime_error_sigfpe` | Arithmetic error, most often division or modulo by zero, or integer overflow in a division. | Runtime error: division by zero or invalid arithmetic. |
| 10 Runtime Error (SIGABRT) | `runtime_error_sigabrt` | The program aborted: a failed `assert`, an uncaught C++ exception, or running out of memory in `new`/`vector`. | Runtime error: the program aborted. |
| 11 Runtime Error (NZEC) | `runtime_error_nzec` | Non-zero exit code. In Python and Java this is usually an uncaught exception (for example `IndexError`, `ValueError` while parsing input, `NullPointerException`). | Runtime error, with the error text when the failing test is a sample. |
| 12 Runtime Error (Other) | `runtime_error_other` | Any other crash, including exceeding the memory limit. | Runtime error: the program crashed or used too much memory. |
| 13 Internal Error | `internal_error` | Judge0 itself failed; not the player's fault. | Judging failed on the server. Try again; tell the committee if it keeps happening. |
| 14 Exec Format Error | `exec_format_error` | Judge0 couldn't run the compiled program; not the player's fault. | Same as internal error. |

Network problems or Judge0 being down (no answer within 90 s) show "The judge is not available right now", and nothing is recorded.

## Scoring

```
efficiency = clamp(1 − 0.3 × (0.7 × time/limit + 0.3 × memory/limit), 0.7, 1)
score      = points × (passed / total) × efficiency
```

`time` is the slowest test's CPU time and `memory` the highest memory use. A submission with no passing test scores 0. Only a team's best score per problem counts toward the leaderboard.

## Server requirement: cgroup v1

Judge0 1.13 runs code inside `isolate`, which needs **cgroup v1**. On a host using cgroup v2 (the default on recent Ubuntu/Debian), every submission returns **Internal Error** with the message `No such file or directory @ rb_sysopen - /box/script.py`.

Fix on the Judge0 server (needs root and a reboot):

```bash
sudo sed -i 's/^GRUB_CMDLINE_LINUX="/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0 /' /etc/default/grub
sudo update-grub
sudo reboot
# after the reboot, restart Judge0
docker compose up -d
```

Check with a test submission: `print(1)` in Python must return status 3 with output `1`.
