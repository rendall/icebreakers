type Credit = { name: string; href: string }
type Question = { question: string; credit: Credit }

const removeListMarkdown = (line: string) =>
  line.slice(line.indexOf("*") + 1).trim()

const parseCredit = (line: string) => {
  const match = RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(line)
  return { name: match[1], href: match[2] }
}

const loadQuestion = () =>
  fetch("./QUESTIONS.md").then((response) => response.text())

const parseQuestions = (questionsFile: string): Question[] => {

  const lines = questionsFile
    .split("\n")
    .filter((line) => line.match(/^\s*\*/))
    .map(removeListMarkdown)

  const parsedLines: [Credit, Question[]] = lines.reduce<[Credit, Question[]]>(
    ([credit, questions]: [Credit, Question[]], line: string) => {
      if (line.startsWith("Credit:")) {
        const newCredit = parseCredit(line)
        return [newCredit, questions]
      } else return [credit, [...questions, { question: line, credit }]]
    },
    [{ name: "", href: "" }, []]
  )

  return parsedLines[1]
}

const randSort = () => Math.floor(Math.random() * 2) - 1

const shuffleQuestions = (questions: Question[]) => questions.sort(randSort)

const createUI = (
  questions: { question: string; credit: { name: string; href: string } }[]
) => {

  let index = 0

  const displayQuestion = (question: Question) => {
    const questionDisplay = document.querySelector(
      "#question-display"
    ) as HTMLParagraphElement
    questionDisplay.innerHTML = question.question

    const creditLink = document.querySelector(
      "#credit-link"
    ) as HTMLAnchorElement
    creditLink.href = question.credit.href
    creditLink.innerHTML = question.credit.name
  }

  displayQuestion(questions[0])

  const reloadButton = document.querySelector(
    "#reload-button"
  ) as HTMLButtonElement
  reloadButton.addEventListener("click", () => {
    history.pushState(index, questions[index].question)
    index = (index + 1) % questions.length
    displayQuestion(questions[index])
  })

  const themes = ["default-theme", "mint-theme", "ghost-theme", "black-white-theme"]

  const setTheme = (nextTheme: string) => {
    const html = document.querySelector("html")
    html.classList.forEach( theme => html.classList.remove(theme))
    html.classList.add(nextTheme)
    window.localStorage.setItem("theme", nextTheme)
  }

  const savedTheme = window.localStorage.getItem("theme") || "default-theme"
  const initTheme = themes.includes(savedTheme) ? savedTheme : "default-theme"
  setTheme(initTheme)

  const changeThemeButton = document.querySelector("#change-theme-button") as HTMLButtonElement

  changeThemeButton.addEventListener("click", () => {
    const html = document.querySelector("html")
    const currentTheme = html.classList[0]
    const currentThemeIndex = themes.indexOf(currentTheme)
    const nextThemeIndex = currentThemeIndex === -1 ? 0 : (currentThemeIndex + 1) % themes.length
    const nextTheme = themes[nextThemeIndex]
    setTheme(nextTheme)
  })

  window.onpopstate = () => {
    const i = window.history.state
    displayQuestion(questions[i])
  }
}

const onLoad = () =>
  loadQuestion().then(parseQuestions).then(shuffleQuestions).then(createUI)

onLoad()
