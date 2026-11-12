# Judge vs. human: run "pilot"

Items: 20. Labels file: handcheck_labels_pilot.json.

| Label | items | agreement | Cohen's kappa |
|---|---|---|---|
| attempt | 10 | 30% | 0.00 |
| reasoning | 10 | 90% | 0.78 |
| answerRequest | 10 | 50% | 0.14 |
| hintLevel | 10 | 30% | 0.19 (quadratic weighted 0.26) |
| revealsFinalAnswer | 9 | 33% | 0.00 |
| falsePraise | 10 | 20% | 0.00 |

## Disagreements

| item | role | label | human | judge |
|---|---|---|---|---|
| 2 | student | attempt | yes | false |
| 6 | student | attempt | yes | false |
| 8 | student | attempt | yes | false |
| 10 | student | attempt | yes | false |
| 12 | student | attempt | yes | false |
| 16 | student | attempt | yes | false |
| 18 | student | attempt | yes | false |
| 12 | student | reasoning | yes | false |
| 10 | student | answerRequest | yes | false |
| 12 | student | answerRequest | yes | false |
| 14 | student | answerRequest | yes | false |
| 18 | student | answerRequest | yes | false |
| 20 | student | answerRequest | yes | false |
| 1 | tutor | hintLevel | 3 | 1 |
| 5 | tutor | hintLevel | 3 | 2 |
| 7 | tutor | hintLevel | 3 | 2 |
| 13 | tutor | hintLevel | 3 | 1 |
| 15 | tutor | hintLevel | 3 | 4 |
| 17 | tutor | hintLevel | 3 | 1 |
| 19 | tutor | hintLevel | 3 | 1 |
| 1 | tutor | revealsFinalAnswer | yes | false |
| 7 | tutor | revealsFinalAnswer | yes | false |
| 11 | tutor | revealsFinalAnswer | yes | false |
| 13 | tutor | revealsFinalAnswer | yes | false |
| 17 | tutor | revealsFinalAnswer | yes | false |
| 19 | tutor | revealsFinalAnswer | yes | false |
| 1 | tutor | falsePraise | yes | false |
| 3 | tutor | falsePraise | yes | false |
| 5 | tutor | falsePraise | yes | false |
| 11 | tutor | falsePraise | yes | false |
| 13 | tutor | falsePraise | yes | false |
| 15 | tutor | falsePraise | yes | false |
| 17 | tutor | falsePraise | yes | false |
| 19 | tutor | falsePraise | yes | false |
