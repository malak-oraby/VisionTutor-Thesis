# Picks real StudyChat student messages to seed the phrasing of each
# simulated learner type. Run once:
#   python3 -I scripts/harness/make_seeds.py ~/Downloads/studychat_sample_for_labeling.csv
# Writes scripts/harness/learner_seeds.json.
#
# Messages are matched to a type by simple keyword rules, so the seeds only
# shape the learners' wording; they are not labels of the real students.
import csv
import json
import random
import re
import sys
from pathlib import Path

SEED = 42
PER_TYPE = 5

RULES = {
    "analytical": r"\b(i think|because|i tried|my approach|so that means|i got)\b",
    "answer-seeking": r"\b(give me|write (the|a|me)|just tell|what is the answer|solve|can you do|complete the code|fix my code)\b",
    "impatient": None,  # very short messages, see below
    "confused": r"\b(confused|don'?t understand|do not understand|what does|i'?m lost|makes no sense|not sure)\b",
    "overconfident": r"\b(obviously|i'?m sure|surely|isn'?t it just|it'?s just|definitely|of course)\b",
    "curious": r"\b(why does|why is|why do|how does|what if|what happens if|is there a way)\b",
}


def learner_messages(conversation: str):
    for line in conversation.split("\n"):
        m = re.match(r"^L\d+:\s*(.+)$", line.strip())
        if m:
            text = m.group(1).strip()
            # skip pasted code, long pastes and clipped messages
            if (
                8 <= len(text) <= 180
                and "...[cut]" not in text
                and " " in text
                # plain sentences only: no code, markdown or pasted output
                and re.fullmatch(r"[A-Za-z0-9 ,.'?!^:/-]+", text)
                and not re.search(r"\bdef |import |class |Exception", text)
            ):
                yield text


def main():
    csv.field_size_limit(10**9)
    path = Path(sys.argv[1]).expanduser()
    rows = list(csv.DictReader(open(path, encoding="utf-8")))
    msgs = sorted({m for r in rows for m in learner_messages(r["conversation"])})

    rng = random.Random(SEED)
    seeds = {}
    for kind, rule in RULES.items():
        if rule is None:
            pool = [m for m in msgs if len(m.split()) <= 6]
        else:
            pool = [m for m in msgs if re.search(rule, m, re.I)]
        rng.shuffle(pool)
        seeds[kind] = pool[:PER_TYPE]
        print(f"{kind}: {len(pool)} matching messages, kept {len(seeds[kind])}")

    out = Path(__file__).with_name("learner_seeds.json")
    out.write_text(json.dumps({"source": "StudyChat sample (105 conversations), seed 42", "seeds": seeds}, indent=2, ensure_ascii=False) + "\n")
    print("Wrote", out)


if __name__ == "__main__":
    main()
