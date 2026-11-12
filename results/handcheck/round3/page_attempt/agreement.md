# Judge vs. human: run "pilot2"

Items: 20. Labels file: handcheck_labels_round3.json.

| Label | items | agreement | Cohen's kappa |
|---|---|---|---|
| attempt | 10 | 80% | 0.41 |
| reasoning | 10 | 70% | 0.29 |
| answerRequest | 10 | 40% | 0.09 |
| hintLevel | 10 | 20% | 0.11 (quadratic weighted 0.14) |
| revealsFinalAnswer | 10 | 10% | 0.00 |
| falsePraise | 10 | 100% | n/a (only one value used) |

## Disagreements

| item | role | label | human | judge |
|---|---|---|---|---|
| 4 | student | attempt | yes | false |
| 14 | student | attempt | yes | false |
| 2 | student | reasoning | yes | false |
| 10 | student | reasoning | yes | false |
| 12 | student | reasoning | yes | false |
| 4 | student | answerRequest | yes | false |
| 6 | student | answerRequest | yes | false |
| 8 | student | answerRequest | yes | false |
| 14 | student | answerRequest | yes | false |
| 18 | student | answerRequest | yes | false |
| 20 | student | answerRequest | yes | false |
| 1 | tutor | hintLevel | 3 | 1 |
| 3 | tutor | hintLevel | 3 | 1 |
| 5 | tutor | hintLevel | 3 | 1 |
| 7 | tutor | hintLevel | 3 | 1 |
| 11 | tutor | hintLevel | 3 | 2 |
| 13 | tutor | hintLevel | 3 | 1 |
| 17 | tutor | hintLevel | 3 | 1 |
| 19 | tutor | hintLevel | 3 | 1 |
| 1 | tutor | revealsFinalAnswer | yes | false |
| 3 | tutor | revealsFinalAnswer | yes | false |
| 5 | tutor | revealsFinalAnswer | yes | false |
| 7 | tutor | revealsFinalAnswer | yes | false |
| 9 | tutor | revealsFinalAnswer | yes | false |
| 11 | tutor | revealsFinalAnswer | yes | false |
| 13 | tutor | revealsFinalAnswer | yes | false |
| 17 | tutor | revealsFinalAnswer | yes | false |
| 19 | tutor | revealsFinalAnswer | yes | false |
