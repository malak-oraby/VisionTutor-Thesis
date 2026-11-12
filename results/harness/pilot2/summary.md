# Results: run "pilot2"

Sessions judged: 35 (baseline 12, strategy 12, adaptive 11). Hint cap 3.

## Means per version

| Measure | baseline | strategy | adaptive |
|---|---|---|---|
| Reasoning rate (higher is better) | 0.29 | 0.43 | 0.40 |
| Answer-seeking rate (lower is better) | 0.34 | 0.30 | 0.34 |
| Hint appropriateness (higher is better) | 0.26 | 0.72 | 0.58 |
| Solution leakage (lower is better) | 0.58 | 0.00 | 0.00 |
| False praise (lower is better) | 0.00 | 0.00 | 0.00 |
| Success (higher is better) | 0.50 | 0.67 | 0.91 |
| Turns to solve (successful) (lower is better) | 3.67 | 4.25 | 5.60 |

## H1: strategy minus baseline (paired, bootstrap 95% CI)

| Measure | pairs | difference | 95% CI | direction |
|---|---|---|---|---|
| Reasoning rate | 12 | 0.14 | [0.07, 0.20] | strategy better |
| Answer-seeking rate | 12 | -0.04 | [-0.16, 0.08] | no clear difference |
| Hint appropriateness | 12 | 0.47 | [0.21, 0.70] | strategy better |
| Solution leakage | 12 | -0.58 | [-0.83, -0.33] | strategy better |
| False praise | 12 | 0.00 | [0.00, 0.00] | no clear difference |
| Success | 12 | 0.17 | [0.00, 0.42] | no clear difference |
| Turns to solve (successful) | 6 | 0.00 | [-0.83, 0.67] | no clear difference |

## H2: adaptive minus strategy (paired, bootstrap 95% CI)

| Measure | pairs | difference | 95% CI | direction |
|---|---|---|---|---|
| Reasoning rate | 11 | 0.00 | [-0.14, 0.13] | no clear difference |
| Answer-seeking rate | 11 | 0.04 | [-0.02, 0.11] | no clear difference |
| Hint appropriateness | 11 | -0.11 | [-0.29, 0.05] | no clear difference |
| Solution leakage | 11 | 0.00 | [0.00, 0.00] | no clear difference |
| False praise | 11 | 0.00 | [0.00, 0.00] | no clear difference |
| Success | 11 | 0.27 | [0.00, 0.55] | no clear difference |
|  ↳ non-inferiority (margin 10 points) | | | lower bound 0.00 | met |
| Turns to solve (successful) | 7 | 0.57 | [-0.57, 1.71] | no clear difference |

## By learner type (means)

### Reasoning rate

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 0.63 | 0.88 | 0.80 |
| answer-seeking | 0.00 | 0.00 | 0.10 |
| confused | 0.13 | 0.33 | 0.45 |
| curious | 0.50 | 0.62 | 0.62 |
| impatient | 0.00 | 0.00 | 0.07 |
| overconfident | 0.50 | 0.75 | 0.33 |

### Answer-seeking rate

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 0.13 | 0.00 | 0.00 |
| answer-seeking | 0.50 | 0.73 | 0.73 |
| confused | 0.20 | 0.11 | 0.10 |
| curious | 0.20 | 0.14 | 0.21 |
| impatient | 0.67 | 0.70 | 0.86 |
| overconfident | 0.38 | 0.13 | 0.00 |

### Solution leakage

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 0.00 | 0.00 | 0.00 |
| answer-seeking | 1.00 | 0.00 | 0.00 |
| confused | 0.50 | 0.00 | 0.00 |
| curious | 1.00 | 0.00 | 0.00 |
| impatient | 1.00 | 0.00 | 0.00 |
| overconfident | 0.00 | 0.00 | 0.00 |

### Success

| Learner | baseline | strategy | adaptive |
|---|---|---|---|
| analytical | 1.00 | 1.00 | 1.00 |
| answer-seeking | 0.00 | 0.50 | 1.00 |
| confused | 0.50 | 0.50 | 1.00 |
| curious | 0.50 | 1.00 | 1.00 |
| impatient | 0.00 | 0.00 | 0.50 |
| overconfident | 1.00 | 1.00 | 1.00 |

## V2 adaptation

Sessions that used each mode at least once: scaffold 5, standard 11, challenge 5 (of 11).

Limitations: simulated learners, LLM judge (not yet checked by a human), small sample in pilot runs.
