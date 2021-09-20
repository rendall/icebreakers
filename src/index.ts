import "./style.css";

type Credit = { name: string; href: string };
type Question = { question: string; credit: Credit };
// Note that Question contains Credit

const removeListMarkdown = (line: string) =>
  line.slice(line.indexOf("*") + 1).trim();

const parseCredit = (line: string) => {
  const match = RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(line);
  return { name: match[1], href: match[2] };
};

const themes = [
  "default-theme",
  "mint-theme",
  "black-white-theme",
  "ghost-theme",
  "sky-theme",
  "amaranth-yellow-theme"
];

const setTheme = (nextTheme: string) => {
  const html = document.querySelector("html");
  html.classList.forEach((theme) => html.classList.remove(theme));
  html.classList.add(nextTheme);
  window.localStorage.setItem("theme", nextTheme);
};

const loadQuestions = () =>
  fetch("./QUESTIONS.md").then((response) => response.text());

/** Accepts QUESTIONS.md text and returns an array of
 * { question, credit } objects */
const parseQuestions = (questionsFile: string): Question[] => {
  const lines = questionsFile
    .split("\n")
    .filter((line) => line.match(/^\s*\*/))
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

const setupUI = (
  questions: Question[]
) => {
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

  const changeThemeButton = document.querySelector(
    "#change-theme-button"
  ) as HTMLButtonElement;

  changeThemeButton.addEventListener("click", () => {
    const body = document.querySelector("body");
    body.classList.add("themed"); // Adds a background transition easing animation
    const html = document.querySelector("html");
    const currentTheme = html.classList[0];
    const currentThemeIndex = themes.indexOf(currentTheme);
    const nextThemeIndex =
      currentThemeIndex === -1 ? 0 : (currentThemeIndex + 1) % themes.length;
    const nextTheme = themes[nextThemeIndex];
    setTheme(nextTheme);
  });

  window.onpopstate = () => {
    const i = window.history.state;
    displayQuestion(questions[i]);
  };
};

const init = () =>
  new Promise<void>((resolve) => {
    const savedTheme = window.localStorage.getItem("theme") || "default-theme";
    const initTheme = themes.includes(savedTheme)
      ? savedTheme
      : "default-theme";
    setTheme(initTheme);

    resolve();
  });

const onLoad = () =>
  init()
    .then(loadQuestions)
    .then(parseQuestions)
    .then(shuffleQuestions)
    .then(setupUI);

onLoad();
