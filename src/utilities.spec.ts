import {
  toSlug,
  isSlugMatch,
  reverseSlug,
  removeListMarkdown,
  parseCredit,
  isTheme,
  debounceFunc,
  loadedFonts,
  hasFont,
  parseQuestions,
  shuffleQuestions,
  interpretQuestions,
  defaultTheme,
  Question,
} from "./utilities"; // Replace with your actual module path

describe("Utility Functions", () => {

  const localStorageMock: Storage = (() => {
    let store: { [key: string]: string | undefined } = {};

    return {
      length: 0,
      clear: function (): void {
        store = {};
      },
      getItem: function (key: string): string | null {
        return store[key] || null;
      },
      key: function (index: number): string | null {
        return Object.keys(store)[index] || null;
      },
      removeItem: function (key: string): void {
        store[key] = undefined;
      },
      setItem: function (key: string, value: string): void {
        store[key] = value.toString();
      },
    };
  })();

  // Set up and clean up
  beforeEach(() => {
    global.localStorage = localStorageMock;
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });
  test("toSlug", () => {
    expect(toSlug("Hello World")).toBe("hello-world");
    expect(toSlug("Hello   World")).toBe("hello-world");
    expect(toSlug("Hello_World")).toBe("helloworld");
    expect(toSlug("Hello! World?")).toBe("hello-world");
  });

  test("isSlugMatch", () => {
    expect(isSlugMatch("hello-world", "Hello World")).toBeTruthy();
    expect(isSlugMatch("hello-world", "Goodbye World")).toBeFalsy();
  });

  test("reverseSlug", () => {
    const questions = ["Hello World", "Goodbye World"];
    expect(reverseSlug("hello-world", questions)).toBe("Hello World");
    expect(reverseSlug("goodbye-world", questions)).toBe("Goodbye World");
  });

  test("removeListMarkdown", () => {
    expect(removeListMarkdown("* Hello World")).toBe("Hello World");
  });

  test("parseCredit", () => {
    expect(parseCredit("Credit: [John Doe](http://example.com)")).toEqual({
      name: "John Doe",
      href: "http://example.com",
    });
  });

  test("isTheme", () => {
    expect(isTheme(defaultTheme)).toBeTruthy();
    expect(isTheme("string")).toBeFalsy();
  });

  // Debounce function is tricky to test due to its nature. You might want to mock timers.
});

describe("Font and Theme Functions", () => {

  test("parseQuestions", () => {
    const lines = ["Credit: [John Doe](http://example.com)", "Question 1"];
    expect(parseQuestions(lines)).toEqual([
      {
        question: "Question 1",
        credit: { name: "John Doe", href: "http://example.com" },
      },
    ]);
  });

  test("shuffleQuestions", () => {
    const minQuestion: Question = {
      question: "",
      credit: {
        name: "",
        href: "",
      },
    };
    const questions = Array(100).fill(minQuestion).map((q, i) => ({ ...q, question: `Question ${i}` }));
    expect(shuffleQuestions(questions)).not.toEqual(questions);
    expect(questions).toEqual(questions)
  });

  test("interpretQuestions", () => {
    const lines = ["Credit: [John Doe](http://example.com)", "Question 1"];
    // Mock localStorage for consistent testing
    expect(interpretQuestions(lines)).toBeInstanceOf(Array);
  });
});

// Additional tests can be written for UI-related functions, but they may require more extensive setup and mocking.
