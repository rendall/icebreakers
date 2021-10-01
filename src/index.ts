import "./style.css";

type Credit = { name: string; href: string };
type Question = { question: string; credit: Credit }; // Note that Question contains Credit
type Theme = {
  name: string;
  foreground: string;
  background: string;
  highlight: string;
};

const removeListMarkdown = (line: string) =>
  line.slice(line.indexOf("-") + 1).trim();

const parseCredit = (line: string) => {
  const match = RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(line);
  return { name: match[1], href: match[2] };
};

const defaultTheme: Theme = {
  name: "Carnival",
  background: "#2B50AA",
  foreground: "#FF9FE5",
  highlight: "#FF9FE5"
};

const isTheme = (theme: Theme | string): theme is Theme => typeof theme !== "string" && "foreground" in theme;

const recoverTheme = () => {
  const themeStr = window.localStorage.getItem("theme") || "default-theme";
  const theme: Theme | string = JSON.parse(themeStr);
  return isTheme(theme) ? theme : defaultTheme;
};

const getCurrentTheme = () => ({
  foreground:
    document.documentElement.style.getPropertyValue("--theme-foreground"),
  background:
    document.documentElement.style.getPropertyValue("--theme-background"),
  highlight:
    document.documentElement.style.getPropertyValue("--theme-highlight"),
});

const setTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.style.setProperty("--theme-foreground", theme.foreground);
  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-highlight", theme.highlight);
  window.localStorage.setItem("theme", JSON.stringify(theme));
};

const fetchFile = (url: string) =>
  fetch(url).then((response) => response.text());

const loadQuestions = () => fetchFile("QUESTIONS.md");

const parseThemes = (themesFile: string): Theme[] =>
  themesFile
    .split("\n")
    .filter((line) => line.match(/^-/))
    .map((line) =>
      new RegExp(/^- _([\w \d]*)_ ([\w#]*) ([\w#]*) ([\w#]*)$/).exec(line)
    )
    .map(([, name, background, foreground, highlight]) => ({
      name,
      foreground,
      background,
      highlight,
    }));
const getThemes = () => fetchFile("THEMES.md").then(parseThemes);

/** Accepts QUESTIONS.md text and returns an array of
 * { question, credit } objects */
const parseQuestions = (questionsFile: string): Question[] => {
  const lines = questionsFile
    .split("\n")
    .filter((line) => line.match(/^\s*\-/))
    .map(removeListMarkdown);

  const parsedLines: [Credit, Question[]] = lines.reduce<[Credit, Question[]]>(
    ([credit, questions]: [Credit, Question[]], line: string) => {
      if (line.startsWith("Credit:")) {
        const newCredit = parseCredit(line);
        return [newCredit, questions];
      } else return [credit, [...questions, { question: line, credit }]];
    },
    [{ name: "", href: "" }, []]
  );
  // The 0 index of the [Credit, Question[]] tuple is a helper value
  // to be discarded after the questions array is created
  const [_, questions] = parsedLines;

  return questions;
};

const shuffleSort = () => Math.floor(Math.random() * 2) - 1;
const shuffleQuestions = (questions: Question[]) => questions.sort(shuffleSort);

const setupUI = (questions: Question[]) => {
  let index = 0;

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
  };
  displayQuestion(questions[0]);

  const reloadButton = document.querySelector(
    "#reload-button"
  ) as HTMLButtonElement;

  reloadButton.addEventListener("click", () => {
    history.pushState(index, questions[index].question);
    index = (index + 1) % questions.length;
    displayQuestion(questions[index]);
  });

  window.onpopstate = () => {
    const i = window.history.state;
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
        theme.highlight === currentTheme.highlight
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

    resolve();
  });

const onLoad = () =>
  init()
    .then(loadQuestions)
    .then(parseQuestions)
    .then(shuffleQuestions)
    .then(setupUI)
    .then(setupThemes);

onLoad();
