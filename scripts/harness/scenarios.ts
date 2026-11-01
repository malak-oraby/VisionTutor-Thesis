// The 8 evaluation problems (fixed by the protocol, 31 Oct 2026).
// Each has a known answer so the judge can decide success.

export type Scenario = {
  id: string;
  domain: "math" | "code";
  problem: string; // what the student is trying to solve
  answer: string; // the correct final answer, for the judge only
};

export const SCENARIOS: Scenario[] = [
  {
    id: "pythagoras",
    domain: "math",
    problem: "A right triangle has legs of length 6 and 8. How long is the hypotenuse?",
    answer: "10 (6^2 + 8^2 = 36 + 64 = 100, and the square root of 100 is 10)",
  },
  {
    id: "linear-equation",
    domain: "math",
    problem: "Solve for x: 3x - 7 = 11",
    answer: "x = 6 (add 7 to get 3x = 18, then divide by 3)",
  },
  {
    id: "factor-quadratic",
    domain: "math",
    problem: "Factor x^2 + 5x + 6",
    answer: "(x + 2)(x + 3)",
  },
  {
    id: "add-fractions",
    domain: "math",
    problem: "Add 2/3 + 1/4",
    answer: "11/12 (common denominator 12: 8/12 + 3/12)",
  },
  {
    id: "reverse-string",
    domain: "code",
    problem: "Write a Python function reverse(s) that returns the string s reversed.",
    answer: "def reverse(s): return s[::-1]  (or an equivalent loop)",
  },
  {
    id: "find-max",
    domain: "code",
    problem:
      "Write a Python function find_max(nums) that returns the largest number in a non-empty list, without using the built-in max().",
    answer:
      "Start with best = nums[0], loop over nums, update best when a number is larger, return best",
  },
  {
    id: "off-by-one",
    domain: "code",
    problem:
      "This Python code should print the numbers 1 to 10, but it prints 1 to 9. Fix it:\nfor i in range(1, 10):\n    print(i)",
    answer: "Change range(1, 10) to range(1, 11), because the end of range is not included",
  },
  {
    id: "count-vowels",
    domain: "code",
    problem:
      "Write a Python function count_vowels(s) that returns how many vowels (a, e, i, o, u, upper or lower case) are in the string s.",
    answer:
      "Loop over s.lower() and count characters in 'aeiou', e.g. sum(1 for c in s.lower() if c in 'aeiou')",
  },
];
