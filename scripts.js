"use strict";
// https://github.com/Colo-Codes/mini-projects/blob/main/todo-app/js/index.js

// Constants

const COLORS = ["red", "green", "blue", "yellow", "purple", "orange"];

const hideWelcomeJSON = localStorage.getItem("contact_training_hideWelcome");
const historyJSON = localStorage.getItem("contact_training_history");

const hideWelcome = JSON.parse(hideWelcomeJSON);
const history = JSON.parse(historyJSON);

// Application state
const state = {
  time: 30,
  isPaused: false,
  interval: 0,
  hideWelcome: false,
  history: [],
};

// State accessor functions (getters and setters)

function setState(key, val) {
  state[key] = val;
}

function getState(key) {
  return state[key];
}

function setStorage(key, val) {
  const valJSON = JSON.stringify(val);
  localStorage.setItem(`contact_training_${key}`, valJSON);
}

function getStorage(key) {
  const valJSON = localStorage.getItem(`contact_training_${key}`);
  if (valJSON === null) {
    return null;
  }
  const val = JSON.parse(valJSON);
  return val;
}

// DOM node references

const welcome = document.getElementById("welcome");
const training = document.getElementById("training");
const time = document.getElementById("time");
const pauseOptions = document.getElementById("pause-options");

const welcomeToggle = document.getElementById("welcome-toggle");
const trainButton = document.getElementById("train-button");
const instructionsButton = document.getElementById("show-instructions");
const startButton = document.getElementById("start-practice");
const pauseButton = document.getElementById("pause-practice");
const continueButton = document.getElementById("continue-practice");
const discardButton = document.getElementById("discard-practice");

const practiceBoard = document.getElementById("practice-board");
const welcomeToggleCheckbox = document.getElementById(
  "welcome-toggle-checkbox"
);
const welcomeToggleLabel = document.getElementById("welcome-toggle-label");

// DOM update functions

welcomeToggle.addEventListener("click", (e) => toggleWelcome(e));
trainButton.addEventListener("click", startTraining);
instructionsButton.addEventListener("click", showInstructions);
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
continueButton.addEventListener("click", continueTraining);
discardButton.addEventListener("click", discardTraining);

// Event handlers
let isProcessing = false;
function toggleWelcome(e) {
  if (isProcessing) {
    const newState = !getState("hideWelcome");
    setState("hideWelcome", newState);
    setStorage("hideWelcome", newState);
    colorToggleLabel(newState);
  }
  isProcessing = true;
  setTimeout(() => (isProcessing = false), 50);
}

function colorToggleLabel(shouldColor) {
  if (shouldColor) {
    welcomeToggleLabel.style.color = "#2196f3";
  } else {
    welcomeToggleLabel.style.color = "black";
  }
}

function startTraining() {
  hide(welcome);
  show(training);
}

function showInstructions() {
  show(welcome);
  hide(training);
}

function startTimer() {
  drawDot();
  hide(startButton);
  show(pauseButton);

  const interval = setInterval(() => {
    const remainingTime = getState("time");
    if (remainingTime > 0) {
      setState("time", remainingTime - 1);
      setTime(remainingTime - 1);
    } else {
      clearInterval(interval);
      setState("time", 30);
      setTime(30);
    }
  }, 1000);

  setState("interval", interval);
}

function pauseTimer() {
  clearDot();
  const interval = getState("interval");
  clearInterval(interval);
  hide(pauseButton);
  show(pauseOptions);
}

function continueTraining() {
  hide(pauseOptions);
  show(pauseButton);
  startTimer();
}

function discardTraining() {
  show(startButton);
  hide(pauseButton);
  hide(pauseOptions);
  setState("time", 30);
  setTime(30);
}

// Event handler bindings

function show(el) {
  el.classList.remove("hide");
}

function hide(el) {
  el.classList.add("hide");
}

function setTime(seconds) {
  time.innerHTML = seconds + "s";
}

// Utility functions

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function drawDot() {
  const x = getRandomXY().x;
  const y = getRandomXY().y;
  const dot = document.createElement("div");
  dot.classList.add("dot");
  dot.style.position = "absolute";
  dot.style.left = x + "px";
  dot.style.top = y + "px";
  dot.style.backgroundColor = getRandomColor();
  practiceBoard.appendChild(dot);
}

function getRandomColor() {
  return COLORS[getRandomInt(COLORS.length)];
}

function getRandomXY() {
  return {
    x: getRandomInt(practiceBoard.offsetWidth),
    y: getRandomInt(practiceBoard.offsetHeight),
  };
}

function clearDot() {
  practiceBoard.removeChild(practiceBoard.firstChild);
}

function getBoardXY(event) {
  const rect = practiceBoard.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

// Initial setup
if (hideWelcome !== null) {
  setState("hideWelcome", hideWelcome);
  colorToggleLabel(hideWelcome);
  welcomeToggleCheckbox.checked = hideWelcome;
  if (hideWelcome) {
    hide(welcome);
    show(training);
  }
}

if (!!history && !!history.length) {
  setState("history", history);
}
