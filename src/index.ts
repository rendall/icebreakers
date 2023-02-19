import "./style.css";

type Credit = { name: string; href: string };
type Question = { question: string; credit: Credit }; // Note that Question contains Credit
type Theme = {
  name: string;
  foreground: string;
  background: string;
  highlight: string;
  font: string;
};

const LOCAL_STORE_QUESTIONS_KEY = "icebreaker-questions";
const LOCAL_STORE_INDEX_KEY = "icebreaker-index";
const LOCAL_STORE_THEME_KEY = "icebreaker-theme";

const removeListMarkdown = (line: string) =>
  line.slice(line.indexOf("*") + 1).trim();

const parseCredit = (line: string) => {
  const match = RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(line);
  return { name: match[1], href: match[2] };
};

const defaultTheme: Theme = {
  name: "Carnival",
  background: "#2B50AA",
  foreground: "#FF9FE5",
  highlight: "#FF9FE5",
  font: "Rammetto One",
};

const isTheme = (theme: Theme | string): theme is Theme =>
  typeof theme !== "string" && "foreground" in theme;

const recoverTheme = () => {
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

/** For small displays, iteratively expand the question display to fit
 * the 'main' element */
const fitDisplay = () => {
  const main = document.querySelector("main") as HTMLDivElement;
  const { clientWidth } = main;

  // In any case, remove any inline font-size
  const display = document.querySelector("#question-display") as HTMLDivElement;
  display.style.fontSize = "";

  // Only for small display sizes
  if (clientWidth >= 600) {
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

const loadedFonts = (): FontFace[] => {
  let arr: FontFace[] = [];
  document.fonts.forEach((font) => arr.push(font));
  const uq = arr.reduce((acc, curr) => {
    if (!acc.includes(curr.family)) acc.push(curr.family);
    return acc;
  }, []);
  return uq;
};

const getCurrentTheme = () => ({
  foreground:
    document.documentElement.style.getPropertyValue("--theme-foreground"),
  background:
    document.documentElement.style.getPropertyValue("--theme-background"),
  highlight:
    document.documentElement.style.getPropertyValue("--theme-highlight"),
  font: document.documentElement.style.getPropertyValue("--theme-font"),
});

const hasFont = (font: string) =>
  loadedFonts().some((fontFace) => fontFace.family === font);

const setFont = (font: string) => {
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
  link.addEventListener("load", () => {
    document.documentElement.style.setProperty("--theme-font", font);
    fitDisplay();
  });
  link.addEventListener("error", () => {
    if (font !== defaultTheme.font) setFont(defaultTheme.font);
  });
  document.head.appendChild(link);
};

const setTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.style.setProperty("--theme-foreground", theme.foreground);
  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-highlight", theme.highlight);
  setFont(theme.font);
  const display = document.querySelector("#question-display") as HTMLDivElement;
  display.style.fontSize = "";
  window.localStorage.setItem(LOCAL_STORE_THEME_KEY, JSON.stringify(theme));
};

const fetchFile = (url: string) =>
  fetch(url).then((response) => response.text());

const loadQuestions = () =>
  fetchFile("QUESTIONS.md").then((questionsFile) =>
    questionsFile
      .split("\n")
      .filter((line) => line.match(/^\s*\*/))
      .map(removeListMarkdown)
  );

const parseThemes = (themesFile: string): Theme[] =>
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
const getThemes = () => fetchFile("THEMES.md").then(parseThemes);

/** Accepts lines of text from QUESTIONS.md and returns an array of
 * { question, credit } objects */
const parseQuestions = (lines: string[]): Question[] => {
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
const shuffleQuestions = (questions: Question[]) => {
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

const setupUI = (questions: Question[]) => {
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

    fitDisplay();
  };

  displayQuestion(questions[index]);

  const reloadButton = document.querySelector(
    "#reload-button"
  ) as HTMLButtonElement;

  reloadButton.addEventListener("click", () => {
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

const setupThemes = async () => {
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

const init = () =>
  new Promise<void>((resolve) => {
    const initTheme = recoverTheme();
    setTheme(initTheme);
    window.addEventListener("resize", fitDisplay);
    resolve();
  });

/** Return stored questions if they exist and are updated.
 * Return loaded, parsed and shuffled questions if not.  */
const interpretQuestions = (lines: string[]) => {
  const localQuestions: string =
    localStorage.getItem(LOCAL_STORE_QUESTIONS_KEY) ?? "[]";
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

const onLoad = () =>
  init()
    .then(loadQuestions)
    .then(interpretQuestions)
    .then(setupUI)
    .then(setupThemes);

onLoad();
