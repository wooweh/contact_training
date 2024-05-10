"use strict";

// Constants

const COLORS = ["red", "green", "blue", "yellow", "purple", "orange"];

const hideWelcome = getStorage("hideWelcome");
const historyStorage = getStorage("history");

const TIME = 15;

// Application state
const state = {
  time: TIME,
  hideWelcome: false,
  isPracticing: false,
  isPaused: false,
  interval: 0,
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
const historySideBar = document.getElementById("history");
const historyBar = document.getElementById("history-bar");
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
historySideBar.addEventListener("mouseleave", () => collapseSideBar());
historyBar.addEventListener("mouseenter", () => expandSideBar());

// Event handlers
let isProcessing = false;
/**
 * Toggles the visibility of the welcome page.
 *
 * @return {undefined} No return value.
 */
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

/**
 * Toggles the color of the welcome toggle label.
 *
 * @param {boolean} shouldColor - Determines whether the label should be colored or not.
 * @return {void} This function does not return a value.
 */
function colorToggleLabel(shouldColor) {
  if (shouldColor) {
    welcomeToggleLabel.style.color = "#2196f3";
  } else {
    welcomeToggleLabel.style.color = "#d9d9d9";
  }
}

/**
 * Shows the training page and hides the welcome page.
 *
 * @return {void} This function does not return a value.
 */
function startTraining() {
  hide(welcome);
  show(training);
}

/**
 * Shows the welcome page and hides the training page.
 *
 * @return {void} This function does not return a value.
 */
function showInstructions() {
  show(welcome);
  hide(training);
}

/**
 * Starts the practice session, timer and draws a dot.
 *
 * @return {void} This function does not return a value.
 */
function startPractice() {
  setState("isPracticing", true);
  setState("isPaused", false);
  hide(startButton);
  show(pauseButton);
  hide(pauseOptions);
  startTimer();
  drawDot();
}

/**
 * Pauses the practice session and timer.
 *
 * @return {void} This function does not return a value.
 */
function pausePractice() {
  setState("isPaused", true);
  pauseTimer();
  hide(pauseButton);
  show(pauseOptions);
}

/**
 * Starts a timer that counts down from a given time interval.
 *
 * @return {void} This function does not return a value.
 */
function startTimer() {
  const interval = setInterval(() => {
    const remainingTime = getState("time");
    if (remainingTime > 0) {
      setState("time", remainingTime - 1);
      setTime(remainingTime - 1);
    } else {
      clearInterval(interval);
      setState("time", TIME);
      clearDot();
      setTime(TIME);
      setState("isPracticing", false);
      saveToHistory();
    }
  }, 1000);

  setState("interval", interval);
}

/**
 * Pauses the timer by clearing the interval.
 *
 * @return {void} This function does not return a value.
 */
function pauseTimer() {
  const interval = getState("interval");
  clearInterval(interval);
}

/**
 * Handles the spacebar key press event during practice to toggle pause and start.
 *
 * @param {Event} e - The key press event object.
 * @return {void} This function does not return a value.
 */
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

/**
 * Increments the practice clicks count if the user is currently practicing.
 *
 * @return {void} This function does not return a value.
 */
function practiceClick() {
  const isPracticing = getState("isPracticing");
  const pClicks = getState("practiceClicks");
  if (isPracticing) {
    setState("practiceClicks", pClicks + 1);
  }
}

/**
 * Increments the success clicks count and draws the next dot if the user is practicing.
 *
 * @return {void} This function does not return anything.
 */
function successClick() {
  const isPracticing = getState("isPracticing");
  const sClicks = getState("successClicks");
  if (isPracticing) {
    setState("successClicks", sClicks + 1);
    drawDot();
  }
}

/**
 * Saves the current training session results to history and resets the practice.
 *
 * @return {void}
 */
function saveToHistory() {
  const history = getState("history");
  const pClicks = getState("practiceClicks");
  const sClicks = getState("successClicks");
  const accuracy = pClicks > 0 ? Math.floor((sClicks / pClicks) * 100) : 0;
  const result = [sClicks, accuracy];

  if (history.length > 9) {
    while (history.length > 9) history.shift();
  }
  const newHistory = [...history].push(result);
  clearHistory();
  createHistoryList(newHistory);
  paintHistoryChart(newHistory);
  setStorage("history", newHistory);
  setState("history", newHistory);
  resetPractice();
}

/**
 * Clears the history state, storage, list and chart.
 *
 * @return {void}
 */
function clearHistory() {
  setState("history", []);
  setStorage("history", []);
  while (historyList.firstChild) {
    historyList.removeChild(historyList.firstChild);
  }
  while (historyChart.firstChild) {
    historyChart.removeChild(historyChart.firstChild);
  }
}

/**
 * Resets the practice session.
 *
 * @return {void} This function does not return a value.
 */
function resetPractice() {
  show(startButton);
  hide(pauseButton);
  hide(pauseOptions);
  setState("practiceClicks", 0);
  setState("successClicks", 0);
  setState("time", TIME);
  setTime(TIME);
}

// Event handler bindings

/**
 * Shows the specified element.
 *
 * @param {Element} el - The element to be shown.
 * @return {void} This function does not return a value.
 */
function show(el) {
  el.classList.remove("hide");
}

/**
 * Hides the specified element.
 *
 * @param {HTMLElement} el - The element to hide.
 * @return {void} This function does not return a value.
 */
function hide(el) {
  el.classList.add("hide");
}

/**
 * Collapses the sidebar.
 *
 * @return {void} This function does not return a value.
 */
function collapseSideBar() {
  historySideBar.classList.add("collapse");
  historyBar.classList.remove("hide");
}

/**
 * Expands the sidebar.
 *
 */
function expandSideBar() {
  historySideBar.classList.remove("collapse");
  historyBar.classList.add("hide");
}

/**
 * Sets the seconds value in the timer.
 *
 * @param {number} seconds - The number of seconds to display.
 * @return {void} This function does not return a value.
 */
function setTime(seconds) {
  time.innerHTML = seconds + "s";
}

/**
 * Draws a dot on the practice board at a random position with a random color.
 *
 * @return {void} This function does not return a value.
 */
function drawDot() {
  clearDot();
  const { x, y } = getRandomXY();
  const dot = document.createElement("div");
  dot.id = "practice-dot";
  dot.classList.add("dot");
  dot.style.left = x + "px";
  dot.style.top = y + "px";
  dot.style.backgroundColor = getRandomColor();
  dot.addEventListener("click", successClick);
  practiceBoard.appendChild(dot);
}

/**
 * Clears the dot from the practice board.
 *
 * @return {void} This function does not return a value.
 */
function clearDot() {
  const dot = document.getElementById("practice-dot");
  if (!!dot) dot.remove();
}

/**
 * Creates a history chart in the sidebar.
 *
 * @param {Array} history - The history data to be visualized.
 * @return {void} This function does not return a value.
 */
function paintHistoryChart(history) {
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
  if (highest === lowest) {
    chartLowerYVal.innerHTML = 0;
  } else {
    chartLowerYVal.innerHTML = lowest;
  }

  history.forEach((result) => {
    const chartPointContainer = document.createElement("div");
    chartPointContainer.classList.add("chart-point-container");

    const chartPoint = document.createElement("div");
    chartPoint.classList.add("chart-point");
    const bottomPercentage = getChartPointBottom(result[0], lowest, highest);
    chartPoint.style.bottom = bottomPercentage;

    chartPointContainer.appendChild(chartPoint);
    historyChart.appendChild(chartPointContainer);
  });
}

/**
 * Creates a history list in the sidebar.
 *
 * @param {Array} history - An array of history items to be displayed.
 * @return {void} This function does not return a value.
 */
function createHistoryList(history) {
  history.forEach((result) => {
    const child = document.createElement("li");
    child.innerHTML = getResultText(result);
    historyList.insertBefore(child, historyList.firstChild);
  });
}

// Utility functions

/**
 * Calculates the vertical position of a chart point.
 *
 * @param {number} score - The number of successful clicks.
 * @param {number} lowest - The lowest historic score.
 * @param {number} highest - The highest historic score.
 * @return {string} The CSS calc expression representing the bottom position of the chart point.
 */
function getChartPointBottom(score, lowest, highest) {
  const clicksDiff = score - lowest;
  const totalDiff = highest - lowest;
  if (totalDiff === 0) return `calc(100% - 30px)`;

  const pcnt = (100 * clicksDiff) / totalDiff;
  return `calc(${pcnt}% - ${(40 * pcnt) / 100 - 10}px)`;
}

/**
 * Generates a random integer between 0 (inclusive) and the specified maximum (exclusive).
 *
 * @param {number} max - The exclusive upper bound of the random integer to be generated.
 * @return {number} A random integer between 0 and max (exclusive).
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Returns a random color from the COLORS array.
 *
 * @return {string} A randomly selected color from the COLORS array.
 */
function getRandomColor() {
  return COLORS[getRandomInt(COLORS.length)];
}

/**
 * Generates a random x and y coordinate within the boundaries of the practiceBoard.
 *
 * @return {Object} An object containing randomly generated x and y coordinates.
 */
function getRandomXY() {
  return {
    x: getRandomInt(practiceBoard.offsetWidth),
    y: getRandomInt(practiceBoard.offsetHeight),
  };
}

/**
 * Calculates the x and y coordinates of a click on the practice board.
 *
 * @param {Event} event - The client event object.
 * @return {Object} An object containing the x and y coordinates.
 */
function getBoardXY(event) {
  const rect = practiceBoard.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * Generates a result text based on the given result.
 *
 * @param {Array} result - An array containing the number of clicks and accuracy percentage.
 * @return {string} The result text in the format "X Clicks, Y% Accuracy".
 */
function getResultText(result) {
  return `${result[0]} Clicks, ${result[1]}% Accuracy`;
}

// Initial setup

time.innerHTML = `${TIME}s`;

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
  if (historyStorage.length > 10) {
    while (historyStorage.length > 10) historyStorage.shift();
  }
  setState("history", historyStorage);
  createHistoryList(historyStorage);
  paintHistoryChart(historyStorage);
}
