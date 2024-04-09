"use strict";
// https://github.com/Colo-Codes/mini-projects/blob/main/todo-app/js/index.js

// Constants

const COLORS = ["red", "green", "blue", "yellow", "purple", "orange"];

// Application state
const state = {
  time: 30,
  isPaused: false,
  interval: 0,
};

// State accessor functions (getters and setters)

function set(key, val) {
  state[key] = val;
}

// DOM node references

const welcome = document.getElementById("welcome");
const training = document.getElementById("training");
const time = document.getElementById("time");
const pauseOptions = document.getElementById("pause-options");

const trainButton = document.getElementById("train-button");
const instructionsButton = document.getElementById("show-instructions");
const startButton = document.getElementById("start-practice");
const pauseButton = document.getElementById("pause-practice");
const continueButton = document.getElementById("continue-practice");
const discardButton = document.getElementById("discard-practice");

const practiceBoard = document.getElementById("practice-board");

// DOM update functions

trainButton.addEventListener("click", startTraining);
instructionsButton.addEventListener("click", showInstructions);
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
continueButton.addEventListener("click", continueTraining);
discardButton.addEventListener("click", discardTraining);

// Event handlers

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
    const remainingTime = state.time;
    if (remainingTime > 0) {
      set("time", remainingTime - 1);
      setTime(remainingTime - 1);
    } else {
      clearInterval(interval);
      set("time", 30);
      setTime(30);
    }
  }, 1000);

  set("interval", interval);
}

function pauseTimer() {
  clearDot();
  clearInterval(state.interval);
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
  set("time", 30);
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
  console.log(practiceBoard.width, practiceBoard.height, x, y);
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
