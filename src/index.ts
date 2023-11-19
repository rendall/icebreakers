import "./style.css";
import { init, interpretQuestions, loadQuestions, setupThemes, setupUI } from "./utilities";

const onLoad = () =>
  init()
    .then(loadQuestions)
    .then(interpretQuestions)
    .then(setupUI)
    .then(setupThemes);

onLoad();
