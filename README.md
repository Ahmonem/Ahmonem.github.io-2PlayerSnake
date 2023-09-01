# Multiplayer Snake Game with Firebase

## Features

- Multiplayer functionality using Firebase Realtime Database.
- Control your snake using the W, A, S, D keys.
- Eat apples to grow your snake's length.
- Be strategic: Eating an apple spawns a tree, blocking movement on that square.

## How to Play

1. **Clone or Download the Repository:**
git clone https://github.com/your-username/multiplayer-snake-game.git

3. **Open the Game:**
- Navigate to the project directory and open `index.html` in your preferred web browser.

3. **Game Controls:**
- Use the **W, A, S, D** keys to control the snake's movement.
- Try to eat as many apples as possible to grow longer.

4. **Spawning Trees:**
- Every time you eat an apple, a tree will spawn on the map.
- Trees block movement, so plan your moves carefully.

5. **Multiplayer:**
- The game uses Firebase Realtime Database to enable multiplayer functionality.
- Share the game URL with your friends to play together in real-time.

## Firebase Setup

To set up Firebase for this game, follow these steps:

1. **Create a Firebase Project:**
- Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2. **Add Firebase Configuration:**
- In the project settings, you'll find the Firebase configuration object. Replace the configuration in `script.js` with your own.

3. **Enable Realtime Database:**
- In the Firebase console, navigate to "Database" in the left sidebar.
- Create a new Realtime Database.
- Set the security rules to allow read and write access.

## Contributions

Contributions are welcome! If you find any bugs or want to enhance the game, feel free to fork this repository, make your changes, and create a pull request.

## Credits

- This game was inspired by the classic Snake game.
- Firebase was used to enable real-time multiplayer functionality.
