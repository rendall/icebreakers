import { readFileSync } from "fs";
import { reverseSlug, toSlug } from "./utilities";

describe("QUESTIONS.md", () => {
  const questionsFile = readFileSync("QUESTIONS.md", "utf8");
  const questionLines = questionsFile
    .split("\n")
    .filter((line) => line.startsWith("  * "));
  const questionRegExp = new RegExp(/^\s{2}\*\s[A-Z\d].*["!?\.\)]$/gm);
  const questions = questionLines.map((question) => question.slice(4));
  const credits = questionsFile
    .split("\n")
    .filter((line) => line.startsWith("* "));

  // regex should fit `* Credit: [Source](https://source-url.com)`
  const creditsRegExp = new RegExp(/^\* Credit: \[.*\]\(https:.*\)$/gm);

  it("should exist", () => {
    expect(questionsFile).toBeDefined();
  });

  it("should have at least one question", () => {
    expect(questionLines.length).toBeGreaterThan(0);
  });

  describe("slug", () => {
    const slugs = questions.map((question) => toSlug(question));
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

    test.each(slugs)("%s should be properly formatted", (slug) => {
      expect(slug).toMatch(slugRegex);
    })

    test.each(slugs)("%s should be unique", (slug) => {
      const numSlugs = slugs.filter((s) => s === slug).length;
      expect(numSlugs).toBe(1);
    });

    test("should not find non-existant question", () => {
      const question = reverseSlug("this-question-does-not-exist", questions);
      expect(question).not.toBeDefined();
    });

    test("should find correct question", () => {
      const question = reverseSlug(
        "how-many-states-or-provinces-or-countries-have-you-been-to",
        questions
      );
      expect(question).toBe(
        "How many states (or provinces or countries) have you been to?"
      );
    });
  });

  describe("Question list", () => {
    test.each(questionLines)("Question '%s' should be properly formatted", (question) => {
      expect(question.match(questionRegExp)).toBeTruthy();
    });

    test.each(questions)("Question '%s' should be unique", (question) => {
      const numQuestions = questions.filter((s) => s === question).length;
      expect(numQuestions).toBe(1);
    });

    test.each(credits)("Credit '%s' should be properly formatted", (credit) => {
      expect(credit.match(creditsRegExp)).toBeTruthy();
    });
  });
});
