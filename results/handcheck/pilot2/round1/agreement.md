# Judge vs. human: run "pilot2"

Items: 20. Labels file: handcheck_labels.json.

| Label | items | agreement | Cohen's kappa |
|---|---|---|---|
| attempt | 10 | 80% | 0.52 |
| reasoning | 10 | 40% | 0.09 |
| answerRequest | 10 | 50% | 0.00 |
| hintLevel | 10 | 10% | -0.03 (quadratic weighted -0.36) |
| revealsFinalAnswer | 10 | 60% | 0.31 |
| falsePraise | 10 | 70% | 0.00 |

## Disagreements

| item | role | label | human | judge |
|---|---|---|---|---|
| 12 | student | attempt | yes | false |
| 14 | student | attempt | no | true |
| 2 | student | reasoning | yes | false |
| 4 | student | reasoning | yes | false |
| 8 | student | reasoning | yes | false |
| 12 | student | reasoning | yes | false |
| 18 | student | reasoning | yes | false |
| 20 | student | reasoning | yes | false |
| 10 | student | answerRequest | yes | false |
| 12 | student | answerRequest | yes | false |
| 16 | student | answerRequest | yes | false |
| 18 | student | answerRequest | yes | false |
| 20 | student | answerRequest | yes | false |
| 1 | tutor | hintLevel | 0 | 4 |
| 3 | tutor | hintLevel | 2 | 0 |
| 5 | tutor | hintLevel | 3 | 2 |
| 7 | tutor | hintLevel | 0 | 4 |
| 9 | tutor | hintLevel | 3 | 1 |
| 11 | tutor | hintLevel | 3 | 0 |
| 13 | tutor | hintLevel | 3 | 0 |
| 15 | tutor | hintLevel | 2 | 0 |
| 17 | tutor | hintLevel | 3 | 1 |
| 3 | tutor | revealsFinalAnswer | yes | false |
| 13 | tutor | revealsFinalAnswer | yes | false |
| 15 | tutor | revealsFinalAnswer | yes | false |
| 17 | tutor | revealsFinalAnswer | yes | false |
| 1 | tutor | falsePraise | yes | false |
| 9 | tutor | falsePraise | yes | false |
| 19 | tutor | falsePraise | yes | false |
