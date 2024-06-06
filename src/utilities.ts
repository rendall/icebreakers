export type Credit = { name: string; href: string };
export type Question = { question: string; credit: Credit }; // Note that Question contains Credit
export type Theme = {
  name: string;
  foreground: string;
  background: string;
  highlight: string;
  font: string;
};

export const toSlug = (str: string):string => str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/_/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/-$/, "")
    .replace(/^-/, "")

export const isSlugMatch = (slug: string, question: string) => slug === toSlug(question);

export const reverseSlug = (slug: string, questions: string[]) => questions.find((question) => isSlugMatch(slug, question));


export const LOCAL_STORE_QUESTIONS_KEY = "icebreaker-questions";
export const LOCAL_STORE_INDEX_KEY = "icebreaker-index";
export const LOCAL_STORE_THEME_KEY = "icebreaker-theme";

export const removeListMarkdown = (line: string) =>
  line.slice(line.indexOf("*") + 1).trim();

export const parseCredit = (line: string) => {
  const match = RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(line);
  return { name: match[1], href: match[2] };
};

export const defaultTheme: Theme = {
  name: "Carnival",
  background: "#2B50AA",
  foreground: "#FF9FE5",
  highlight: "#FF9FE5",
  font: "Rammetto One",
};

export const isTheme = (theme: Theme | string): theme is Theme =>
  typeof theme !== "string" && "foreground" in theme;

export const recoverTheme = () => {
  const themeStr =
    window.localStorage.getItem(LOCAL_STORE_THEME_KEY) || "default-theme";
  try {
    const theme: Theme | string = JSON.parse(themeStr);
    if (!isTheme(theme)) return defaultTheme;
    return { ...defaultTheme, ...theme };
  } catch (error) {
    return defaultTheme;
  }
};

/**
 * Creates a debounced function that delays invoking the provided
 * function until after `wait` milliseconds have elapsed since the
 * last time the debounced function was invoked. Typically used to
 * run an expensive or async function after user interaction.
 *
 * @template T The type of the function to debounce.
 * @param {T} func The function to debounce.
 * @param {number} [wait=250] The number of milliseconds to delay.
 * @returns {(...args: Parameters<T>) => void} Returns the new debounced function.
 *
 * @example
 * // Usage with a function that takes one string parameter
 * const logMessage = (message: string) =>  * const debouncedLogMessage = debounceFunc(logMessage, 300);
 * debouncedLogMessage('Hello, world!');
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounceFunc = <T extends (...args: any[]) => void>(
  func: T,
  wait = 250
) => {
  let debounceTimeout: number | null = null
  return (...args: Parameters<T>): void => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.clearTimeout(debounceTimeout!)
    debounceTimeout = window.setTimeout(() => {
      func(...args)
    }, wait)
  }
}


/** For small displays, iteratively expand the question display to fit
 * the 'main' element */
export const fitDisplay = () => {
  const main = document.querySelector("main") as HTMLDivElement;
  const { clientWidth, clientHeight } = main;

  // In any case, remove any inline font-size
  const display = document.querySelector("#question-display") as HTMLDivElement;
  display.style.fontSize = "";

  // Only for small display sizes
  if (clientWidth >= 600 && clientHeight >= 600) {
    return;
  }

  // Remove question display from flow and hide it to prevent jumping
  document.documentElement.classList.add("font-resizing");

  /** Recursively handle resizing **/
  const reduceSize = (
    fontSize?: number,
    targetWidth?: number,
    targetHeight?: number,
    sanity = 100
  ) => {
    if (fontSize === undefined)
      setTimeout(() => {
        const targetWidth = main.getBoundingClientRect().width;
        const targetHeight = main.getBoundingClientRect().height;
        reduceSize(8, targetWidth, targetHeight);
      }, 1);
    else {
      display.style.fontSize = `${fontSize}rem`;
      setTimeout(() => {
        const isTooLarge =
          display.getBoundingClientRect().width > targetWidth ||
          display.getBoundingClientRect().height > targetHeight;
        if (isTooLarge && sanity > 0) {
          reduceSize(fontSize - 0.1, targetWidth, targetHeight, sanity - 1);
        } else document.documentElement.classList.remove("font-resizing");
      }, 1);
    }
  };

  reduceSize();
};

export const loadedFonts = (): FontFace[] => {
  let fontsArray: FontFace[] = [];
  document.fonts.forEach((font) => fontsArray.push(font));
  const uniqueFontsArray = fontsArray.reduce((acc, curr) => {
    if (!acc.includes(curr.family)) return [...acc, curr.family];
    return acc;
  }, []);
  return uniqueFontsArray;
};

export const getCurrentTheme = () => ({
  foreground:
    document.documentElement.style.getPropertyValue("--theme-foreground"),
  background:
    document.documentElement.style.getPropertyValue("--theme-background"),
  highlight:
    document.documentElement.style.getPropertyValue("--theme-highlight"),
  font: document.documentElement.style.getPropertyValue("--theme-font").replace(/"/g, "")
});

export const hasFont = (font: string) =>
  loadedFonts().some((fontFace) => fontFace.family === font);

export const setFont = (font: string) => {
  const fontName = font.replace(/\s/g, "+").replace(/\"/g, "");
  const fontUrl = `https://fonts.googleapis.com/css?family=${fontName}&display=swap`;

  if (hasFont(font)) {
    fitDisplay();
    return;
  }

  // Google font urls link to @fontface rules and not the fonts themselves.
  const link = document.createElement("link");
  link.href = fontUrl;
  link.rel = "stylesheet";

  // Wrap font name in quotes if it contains spaces
  const themeFont = font.includes(" ") ? `"${font}"` : font;
  link.addEventListener("load", () => {
    document.documentElement.style.setProperty("--theme-font", themeFont);
    fitDisplay();
  });
  link.addEventListener("error", () => {
    if (font !== defaultTheme.font) setFont(defaultTheme.font);
  });
  document.head.appendChild(link);
};

export const setTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.style.setProperty("--theme-foreground", theme.foreground);
  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-highlight", theme.highlight);
  setFont(theme.font);
  const display = document.querySelector("#question-display") as HTMLDivElement;
  display.style.fontSize = "";
  window.localStorage.setItem(LOCAL_STORE_THEME_KEY, JSON.stringify(theme));
  console.info(`Theme ${theme.name}`)
};

export const fetchFile = (url: string) =>
  fetch(url).then((response) => response.text());

export const loadQuestions = () =>
  fetchFile("QUESTIONS.md").then((questionsFile) =>
    questionsFile
      .split("\n")
      .filter((line) => line.match(/^\s*\*/))
      .map(removeListMarkdown)
  );

export const parseThemes = (themesFile: string): Theme[] =>
  themesFile
    .split("\n")
    .filter((line) => line.match(/^\*/))
    .map((line) =>
      new RegExp(
        /^\* _([\w \d]*)_ ([\w#]*) ([\w#]*) ([\w#]*) _([\w \d]*?)_$/
      ).exec(line)
    )
    .map(([, name, background, foreground, highlight, font]) => ({
      name,
      foreground,
      background,
      highlight,
      font,
    }));
export const getThemes = () => fetchFile("THEMES.md").then(parseThemes);

/** Accepts lines of text from QUESTIONS.md and returns an array of
 * { question, credit } objects */
export const parseQuestions = (lines: string[]): Question[] => {
  const parsedLines: [Credit, Question[]] = lines.reduce<[Credit, Question[]]>(
    ([credit, questions]: [Credit, Question[]], line: string) => {
      if (line.startsWith("Credit:")) {
        const newCredit = parseCredit(line);
        return [newCredit, questions];
      } else return [credit, [...questions, { question: line, credit }]];
    },
    [{ name: "", href: "" }, []]
  );
  // Index 0 of the tuple [Credit, Question[]] is a helper value
  // to be discarded after the questions array is created:
  const [_, questions] = parsedLines;

  return questions;
};

/** Shuffle the entire array to avoid repeating questions in the same session */
export const shuffleQuestions = (questions: Question[]) => {
  return questions.reduce(
    (shuffledQuestions, _, i) => {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
      return shuffledQuestions;
    },
    [...questions]
  );
};

export const setupUI = (questions: Question[]) => {
  const localIndex = localStorage.getItem(LOCAL_STORE_INDEX_KEY) ?? "0";
  let index = parseInt(localIndex);

  // Advance the index by 1 if the user has navigated here
  // but not if the user has reloaded the page.
  const didNavigate =
    (
      performance?.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[]
    )?.[0]?.type === "navigate" ||
    performance?.navigation?.type === performance?.navigation?.TYPE_NAVIGATE;

  if (didNavigate && index > 0) index = index + 1;

  const displayQuestion = (question: Question) => {
    const questionDisplay = document.querySelector(
      "#question-display"
    ) as HTMLParagraphElement;
    questionDisplay.innerHTML = question.question;

    const creditLink = document.querySelector(
      "#credit-link"
    ) as HTMLAnchorElement;
    creditLink.href = question.credit.href;
    creditLink.innerHTML = question.credit.name;

    const postLink = document.querySelector(
      "#post-link"
    ) as HTMLAnchorElement;

    const origin = postLink.dataset.origin;
    const postHref = `${origin}/${toSlug(question.question)}`;
    postLink.href = postHref;

    fitDisplay();
  };

  displayQuestion(questions[index]);

  const reloadButton = document.querySelector(
    "#reload-button"
  ) as HTMLButtonElement;

  reloadButton.addEventListener("click", () => {
    const isResizing = document.documentElement.classList.contains("font-resizing");
    if (isResizing) return; // Repeated clicks will cause the font resize to be visible
    index = (index + 1) % questions.length;
    localStorage.setItem(LOCAL_STORE_INDEX_KEY, index.toString());
    window.history.pushState(index, questions[index].question);
    displayQuestion(questions[index]);
  });

  window.onpopstate = () => {
    const i = window.history.state ?? 0;
    localStorage.setItem(LOCAL_STORE_INDEX_KEY, i.toString());
    displayQuestion(questions[i]);
  };
};

export const setupThemes = async () => {
  const themes = await getThemes();
  const changeThemeButton = document.querySelector(
    "#change-theme-button"
  ) as HTMLButtonElement;

  changeThemeButton.addEventListener("click", () => {
    const body = document.querySelector("body");
    body.classList.add("themed"); // Adds a background transition easing animation
    const currentTheme = getCurrentTheme();
    const currentThemeIndex = themes.findIndex(
      (theme) =>
        theme.background === currentTheme.background &&
        theme.foreground === currentTheme.foreground &&
        theme.highlight === currentTheme.highlight &&
        theme.font === currentTheme.font
    );
    const nextThemeIndex =
      currentThemeIndex === -1 ? 0 : (currentThemeIndex + 1) % themes.length;
    const nextTheme = themes[nextThemeIndex];
    setTheme(nextTheme);
  });
};

export const init = () =>
  new Promise<void>((resolve) => {
    const initTheme = recoverTheme();
    setTheme(initTheme);
    window.addEventListener("resize", debounceFunc( fitDisplay ));
    resolve();
  });

/** Return stored questions if they exist and are updated.
 * Return loaded, parsed and shuffled questions if not.  */
export const interpretQuestions = (lines: string[]) => {
  const localQuestions: string =
    localStorage?.getItem(LOCAL_STORE_QUESTIONS_KEY) ?? "[]";
  const storedQuestions = JSON.parse(localQuestions);

  const questionLines = lines.filter((line) => !line.startsWith("Credit: "));
  const isStored = storedQuestions.length === questionLines.length;

  if (isStored) return storedQuestions;

  const parsed = parseQuestions(lines);
  const shuffled = shuffleQuestions(parsed);

  try {
    localStorage.setItem(LOCAL_STORE_QUESTIONS_KEY, JSON.stringify(shuffled));
    localStorage.setItem(LOCAL_STORE_INDEX_KEY, "0");
  } catch (error) {
    // do nothing
  }

  return shuffled;
};

