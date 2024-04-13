"use strict";
// https://github.com/Colo-Codes/mini-projects/blob/main/todo-app/js/index.js

// Drawing board

// click start
// dot appears

// click dot
// current score + 1
// dot changes position
// time === 0
// score saved to history
// practice report appears

// Constants

const COLORS = ["red", "green", "blue", "yellow", "purple", "orange"];

const hideWelcome = getStorage("hideWelcome");
const history = getStorage("history");

// Application state
const state = {
  time: 5,
  isPaused: false,
  isPracticing: false,
  interval: 0,
  hideWelcome: false,
  practiceClicks: 0,
  successClicks: 0,
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
const historyList = document.getElementById("history-list");
const practiceBoard = document.getElementById("practice-board");
const welcomeToggleCheckbox = document.getElementById(
  "welcome-toggle-checkbox"
);
const welcomeToggleLabel = document.getElementById("welcome-toggle-label");
const historyChart = document.getElementById("history-chart");
const chartUpperYVal = document.getElementById("chart-y-upper");
const chartLowerYVal = document.getElementById("chart-y-lower");

const welcomeToggle = document.getElementById("welcome-toggle");
const trainButton = document.getElementById("train-button");
const instructionsButton = document.getElementById("show-instructions");
const startButton = document.getElementById("start-practice");
const pauseButton = document.getElementById("pause-practice");
const continueButton = document.getElementById("continue-practice");
const discardButton = document.getElementById("discard-practice");
const clearHistoryButton = document.getElementById("clear-history");

// DOM update functions

welcomeToggle.addEventListener("click", toggleWelcome);
trainButton.addEventListener("click", startTraining);
instructionsButton.addEventListener("click", showInstructions);
startButton.addEventListener("click", startPractice);
pauseButton.addEventListener("click", pausePractice);
continueButton.addEventListener("click", startPractice);
discardButton.addEventListener("click", resetPractice);
clearHistoryButton.addEventListener("click", clearHistory);
practiceBoard.addEventListener("click", (e) => practiceClick(e));
document.addEventListener("keydown", (e) => practiceSpacebar(e));

// Event handlers
let isProcessing = false;
function toggleWelcome() {
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

function startPractice() {
  setState("isPracticing", true);
  setState("isPaused", false);
  hide(startButton);
  show(pauseButton);
  hide(pauseOptions);
  startTimer();
  drawDot();
}

function pausePractice() {
  setState("isPaused", true);
  pauseTimer();
  hide(pauseButton);
  show(pauseOptions);
}

function startTimer() {
  const interval = setInterval(() => {
    const remainingTime = getState("time");
    if (remainingTime > 0) {
      setState("time", remainingTime - 1);
      setTime(remainingTime - 1);
    } else {
      clearInterval(interval);
      setState("time", 30);
      clearDot();
      setTime(30);
      saveToHistory();
    }
  }, 1000);

  setState("interval", interval);
}

function pauseTimer() {
  const interval = getState("interval");
  clearInterval(interval);
}

function practiceSpacebar(e) {
  const isPracticing = getState("isPracticing");
  const isPaused = getState("isPaused");
  if (isPracticing && e.keyCode === 32) {
    if (isPaused) {
      startPractice();
    } else {
      pausePractice();
    }
  }
}

function practiceClick(e) {
  const isPracticing = getState("isPracticing");
  const pClicks = getState("practiceClicks");
  if (isPracticing) {
    setState("practiceClicks", pClicks + 1);
  }
}

function successClick() {
  const isPracticing = getState("isPracticing");
  const sClicks = getState("successClicks");
  if (isPracticing) {
    setState("successClicks", sClicks + 1);
    drawDot();
  }
}
function saveToHistory() {
  const history = getState("history");
  const pClicks = getState("practiceClicks");
  const sClicks = getState("successClicks");
  const accuracy = Math.floor((sClicks / pClicks) * 100);
  const result = [sClicks, accuracy];

  if (history.length > 9) history.splice(9);
  const newHistory = [...history];
  newHistory.push(result);

  addHistoryItem(result);
  paintHistoryChart(newHistory);
  setStorage("history", newHistory);
  setState("history", newHistory);
  resetPractice();
}

function clearHistory() {
  setState("history", []);
  setStorage("history", []);
  while (historyList.firstChild) {
    historyList.removeChild(historyList.firstChild);
  }
}

function resetPractice() {
  show(startButton);
  hide(pauseButton);
  hide(pauseOptions);
  setState("practiceClicks", 0);
  setState("successClicks", 0);
  setState("time", 30);
  setTime(30);
}

function addHistoryItem(result) {
  const resultText = getResultText(result);
  const child = document.createElement("li");
  child.innerHTML = resultText;
  const firstChild = historyList.firstChild;
  historyList.insertBefore(child, firstChild);
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

function drawDot() {
  clearDot();
  const { x, y } = getRandomXY();
  const dot = document.createElement("div");
  dot.id = "practice-dot";
  dot.classList.add("dot");
  dot.style.position = "absolute";
  dot.style.left = x + "px";
  dot.style.top = y + "px";
  dot.style.backgroundColor = getRandomColor();
  dot.addEventListener("click", successClick);
  practiceBoard.appendChild(dot);
}

function clearDot() {
  const dot = document.getElementById("practice-dot");
  if (!!dot) dot.remove();
}

function paintHistoryChart(history) {
  console.log(history);
  let highest = 0;
  let lowest = Infinity;

  history.forEach((result) => {
    if (result[0] > highest) highest = result[0];
    if (result[0] < lowest) lowest = result[0];
  });

  while (historyChart.hasChildNodes()) {
    historyChart.removeChild(historyChart.firstChild);
  }

  chartUpperYVal.innerHTML = highest;
  chartLowerYVal.innerHTML = lowest;

  history.forEach((result) => {
    const chartPointContainer = document.createElement("div");
    chartPointContainer.classList.add("chart-point-container");

    const chartPoint = document.createElement("div");
    chartPoint.classList.add("chart-point");
    const bottomPercentage = getChartPointBottom(result[0], lowest, highest);
    console.log(bottomPercentage);
    chartPoint.style.bottom = bottomPercentage;

    chartPointContainer.appendChild(chartPoint);
    historyChart.appendChild(chartPointContainer);
  });
}

function createHistoryList(history) {
  history.forEach((result) => {
    const child = document.createElement("li");
    child.innerHTML = getResultText(result);
    historyList.appendChild(child);
  });
}

// Utility functions

function getChartPointBottom(clicks, lowest, highest) {
  const clicksDiff = clicks - lowest;
  const totalDiff = highest - lowest;
  if (totalDiff === 0) return `calc(100% - 30px)`;

  const pcnt = (100 * clicksDiff) / totalDiff;
  return `calc(${pcnt}% - ${(40 * pcnt) / 100 - 10}px)`;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
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

function getBoardXY(event) {
  const rect = practiceBoard.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getResultText(result) {
  return `${result[0]} Clicks, ${result[1]}% Accuracy`;
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
  if (history.length > 10) history.splice(10);
  setState("history", history);
  createHistoryList(history);
  paintHistoryChart(history);
}
