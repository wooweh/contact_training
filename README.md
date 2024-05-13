# Aim Trainer

## Introduction

Aim Trainer is a simple, browser-based tool designed to help users improve their mouse movement and click accuracy. It features a simple interface consisting of an instruction page and a training module. The application is built using vanilla JavaScript, HTML, and CSS, and utilizes local storage for saving user performance history.

## Features

- **Instructions Page**: Provides users with guidelines on how to use the application effectively.
- **Training Page**: Includes a practice module where users can start a countdown timer, during which they must click on randomly appearing dots on the screen.
- **Performance Tracking**: After each session, click count and accuracy are recorded and saved to the user’s history.
- **History Bar**: Displays past results in a list format for quick reference.
- **Data Visualization**: A chart that plots the last 10 training results, showing both click count and accuracy.

## Setup

To get the application running on your local machine, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/wooweh/contact_training.git
   cd contact_training
   ```

2. **Open the Application**
   - Simply open the `index.html` file in any modern web browser.

## Application Structure

- **index.html**: Entry point of the application containing the main HTML structure.
- **styles.css**: Contains all the styling required for the application.
- **script.js**: Includes all the JavaScript logic and state for handling the application's functionality.

## Usage

### Starting a Session

1. Navigate to the training page via the welcome page.
2. Click on the "Start" button to begin the session.
3. Click as many dots as possible before the timer expires. Dots appear at random positions on the board.

### Viewing History

- After each session, the results are automatically saved to local storage.
- Visit the history bar to view a list and visual chart of previous session results.

## Local Storage Structure

The application uses local storage to save the user's history. The data structure is a JSON array of objects, each representing a practice session result:

```json
[
    {
        "clicks": number,
        "accuracy": percentage
    },
    ...
]
```

## License

Unlicensed. Feel free to use the code.
