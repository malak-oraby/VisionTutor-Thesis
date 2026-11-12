# Results: run "judgetest"

Sessions judged: 4 (baseline 1, strategy 1, adaptive 2). Hint cap 3.

## Means per version

| Measure | baseline | strategy | adaptive |
|---|---|---|---|
| Reasoning rate (higher is better) | 0.00 | 0.00 | 0.80 |
| Answer-seeking rate (lower is better) | 0.50 | 0.83 | 0.00 |
| Hint appropriateness (higher is better) | 0.00 | 0.60 | 0.75 |
| Solution leakage (lower is better) | 1.00 | 0.00 | 0.00 |
| False praise (lower is better) | 0.00 | 0.00 | 0.00 |
| Success (higher is better) | 0.00 | 1.00 | 1.00 |
| Turns to solve (successful) (lower is better) | - | 6.00 | 5.00 |

## H1: strategy minus baseline (paired, bootstrap 95% CI)

| Measure | pairs | difference | 95% CI | direction |
|---|---|---|---|---|
| Reasoning rate | 1 | 0.00 | [0.00, 0.00] | no clear difference |
| Answer-seeking rate | 1 | 0.33 | [0.33, 0.33] | strategy worse |
| Hint appropriateness | 1 | 0.60 | [0.60, 0.60] | strategy better |
| Solution leakage | 1 | -1.00 | [-1.00, -1.00] | strategy better |
| False praise | 1 | 0.00 | [0.00, 0.00] | no clear difference |
| Success | 1 | 1.00 | [1.00, 1.00] | strategy better |

## H2: adaptive minus strategy (paired, bootstrap 95% CI)

| Measure | pairs | difference | 95% CI | direction |
|---|---|---|---|---|

## By learner type (means)

### Reasoning rate

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | - | - | 0.75 |
| answer-seeking | 0.00 | 0.00 | - |
| confused | - | - | 0.86 |

### Answer-seeking rate

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | - | - | 0.00 |
| answer-seeking | 0.50 | 0.83 | - |
| confused | - | - | 0.00 |

### Solution leakage

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | - | - | 0.00 |
| answer-seeking | 1.00 | 0.00 | - |
| confused | - | - | 0.00 |

### Success

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | - | - | 1.00 |
| answer-seeking | 0.00 | 1.00 | - |
| confused | - | - | 1.00 |

## V2 adaptation

Sessions that used each mode at least once: scaffold 1, standard 2, challenge 2 (of 2).

Limitations: simulated learners, LLM judge (not yet checked by a human), small sample in pilot runs.
