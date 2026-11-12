# Results: run "pilot"

Sessions judged: 36 (baseline 12, strategy 12, adaptive 12). Hint cap 3.

## Means per version

| Measure | baseline | strategy | adaptive |
|---|---|---|---|
| Reasoning rate (higher is better) | 0.29 | 0.50 | 0.51 |
| Answer-seeking rate (lower is better) | 0.35 | 0.40 | 0.39 |
| Hint appropriateness (higher is better) | 0.13 | 0.86 | 0.71 |
| Solution leakage (lower is better) | 0.67 | 0.00 | 0.00 |
| False praise (lower is better) | 0.00 | 0.08 | 0.00 |
| Success (higher is better) | 0.58 | 0.92 | 0.67 |
| Turns to solve (successful) (lower is better) | 2.86 | 4.73 | 5.13 |

## H1: strategy minus baseline (paired, bootstrap 95% CI)

| Measure | pairs | difference | 95% CI | direction |
|---|---|---|---|---|
| Reasoning rate | 12 | 0.21 | [0.08, 0.36] | strategy better |
| Answer-seeking rate | 12 | 0.05 | [-0.18, 0.27] | no clear difference |
| Hint appropriateness | 12 | 0.73 | [0.53, 0.91] | strategy better |
| Solution leakage | 12 | -0.67 | [-0.92, -0.42] | strategy better |
| False praise | 12 | 0.08 | [0.00, 0.25] | no clear difference |
| Success | 12 | 0.33 | [0.08, 0.58] | strategy better |
| Turns to solve (successful) | 7 | 1.43 | [0.00, 2.71] | no clear difference |

## H2: adaptive minus strategy (paired, bootstrap 95% CI)

| Measure | pairs | difference | 95% CI | direction |
|---|---|---|---|---|
| Reasoning rate | 12 | 0.01 | [-0.11, 0.13] | no clear difference |
| Answer-seeking rate | 12 | -0.01 | [-0.15, 0.12] | no clear difference |
| Hint appropriateness | 12 | -0.15 | [-0.33, -0.01] | adaptive worse |
| Solution leakage | 12 | 0.00 | [0.00, 0.00] | no clear difference |
| False praise | 12 | -0.08 | [-0.25, 0.00] | no clear difference |
| Success | 12 | -0.25 | [-0.58, 0.08] | no clear difference |
|  ↳ non-inferiority (margin 10 points) | | | lower bound -0.58 | not met |
| Turns to solve (successful) | 7 | 0.00 | [-1.14, 1.14] | no clear difference |

## By learner type (means)

### Reasoning rate

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 0.83 | 0.92 | 1.00 |
| answer-seeking | 0.00 | 0.00 | 0.21 |
| confused | 0.38 | 0.76 | 0.55 |
| curious | 0.17 | 0.78 | 0.56 |
| impatient | 0.00 | 0.00 | 0.00 |
| overconfident | 0.38 | 0.53 | 0.73 |

### Answer-seeking rate

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 0.00 | 0.08 | 0.13 |
| answer-seeking | 0.50 | 1.00 | 0.75 |
| confused | 0.21 | 0.12 | 0.13 |
| curious | 0.29 | 0.23 | 0.17 |
| impatient | 0.75 | 0.65 | 1.00 |
| overconfident | 0.38 | 0.33 | 0.17 |

### Solution leakage

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 0.50 | 0.00 | 0.00 |
| answer-seeking | 1.00 | 0.00 | 0.00 |
| confused | 0.50 | 0.00 | 0.00 |
| curious | 0.50 | 0.00 | 0.00 |
| impatient | 1.00 | 0.00 | 0.00 |
| overconfident | 0.50 | 0.00 | 0.00 |

### Success

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 1.00 | 1.00 | 1.00 |
| answer-seeking | 0.00 | 0.50 | 0.50 |
| confused | 0.50 | 1.00 | 1.00 |
| curious | 0.50 | 1.00 | 0.50 |
| impatient | 0.50 | 1.00 | 0.00 |
| overconfident | 1.00 | 1.00 | 1.00 |

## V2 adaptation

Sessions that used each mode at least once: scaffold 5, standard 12, challenge 7 (of 12).

Limitations: simulated learners, LLM judge (not yet checked by a human), small sample in pilot runs.
