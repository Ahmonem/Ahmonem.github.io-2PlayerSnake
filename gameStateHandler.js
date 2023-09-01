import { drawApple, placeApple } from "./apple.js"
import { drawTree } from "./tree.js"
import { drawSnake, getSnakeHead, snakeIntersection, updateSnake, initialzePlayerMovement } from "./player.js"
import { randomGridPosition, getKeyString, outsideGrid, checkIfAPlayerLostGame, checkifLostOrWon } from "./gameMechanics.js"

let lastRenderTime = 0
let SNAKE_SPEED = 5

let gameOver = false

let playerId;
let playerRef;
let players = {};
let playerPositions = []
let characterScores = []
let playerElements = {};
let apple = {}
let tree = {}
let appleElement = {}
let treeElement = {}
let playerOneKey

const gameContainer = document.getElementById('game-board')

function initGame() {

  initialzePlayerMovement()

  const allPlayersRef = firebase.database().ref(`players`);
  const allAppleRef = firebase.database().ref(`apple`);
  const allTreeRef = firebase.database().ref(`tree`)

  allPlayersRef.on("value", (snapshot) => {
    //Fires whenever a change occurs
    players = snapshot.val() || {};
  
    Object.keys(players).forEach((key) => {
      let player = players[key]
   
      if (playerPositions.some(obj => obj.key === key)) {
        playerPositions.forEach((object) => {
          if (object.key === key) {
            object.snakeBody = player.snakeBody
          }
        })
      }
      else {
        playerPositions.push({key: key, snakeBody: player.snakeBody})
      }

      if (characterScores.some(obj => obj.key === key)) {
        characterScores.forEach((object) => {
          if (object.key === key) {
            object.score = player.score
          }
        })
      }
      else {
        characterScores.push({key: key, score: player.score})
      }

    
    })
  })

  function main(currentTime) {
    if (gameOver || checkIfAPlayerLostGame(players).some(checkifLostOrWon)) {
      checkIfAPlayerLostGame(players).forEach((key) => {
        if (key.id === playerId) {
          if (key.lostGame) {
            var audio = new Audio('./assets/Lost.mp3');
            audio.play();
            const winOrLose = document.getElementById('winOrLose')
            winOrLose.innerHTML = "You Lose"
            setTimeout(() => {
              allAppleRef.remove()
              allTreeRef.remove()
              window.location.reload()
            }, 2000)
            
          } 

          if (!key.lostGame) {
            const winOrLose = document.getElementById('winOrLose')
            winOrLose.innerHTML = "You Win"
            console.log("ran")
            setTimeout(() => {
              allAppleRef.remove()
              allTreeRef.remove()
              window.location.reload()
            }, 2000)
          }
          return 
        }
        return
      })
      return
    }

    window.requestAnimationFrame(main)
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return

    lastRenderTime = currentTime

    update()
    draw()
  }

  window.requestAnimationFrame(main)

  function update() {
    updateSnake(players, playerId, playerRef, tree, apple, score)
    checkDeath()
  }

  function draw() {
      gameContainer.innerHTML = ''
      drawSnake(players, gameContainer, playerElements, playerId, characterScores)
      drawApple(appleElement, gameContainer, allAppleRef)
      drawTree(gameContainer, treeElement, allTreeRef)
  }

  

  function checkDeath() {
    if (outsideGrid(getSnakeHead(players, playerId), players, playerId) || snakeIntersection(players, playerId, playerPositions, playerRef) ){
      playerRef.update({
        lostGame: true
      })

      gameOver = outsideGrid(getSnakeHead(players, playerId), players, playerId) || snakeIntersection(players, playerId, playerPositions, playerRef)      
    }
  }

  //Remove character DOM element after they leave
  allPlayersRef.on("child_removed", (snapshot) => {
    const removedKey = snapshot.val().id;
    if (playerElements[removedKey]) {
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
    }
    document.body.removeChild(document.getElementById(removedKey))
  })

  //This block will remove apple from local state when Firebase `apple` value updates
  allAppleRef.on("value", (snapshot) => {
    apple = snapshot.val()
  });

  allTreeRef.on("value", (snapshot) => {
    tree = snapshot.val()
  });
  
  allAppleRef.on("child_removed", (snapshot) => {
    const apple = snapshot.val()

    const key = getKeyString(apple.x, apple.y)

    gameContainer.removeChild(appleElement[key])
    delete appleElement[key]
  })

  allTreeRef.on("child_removed", (snapshot) => {
    const tree = snapshot.val()

    const key = getKeyString(tree.x, tree.y)
    if (treeElement[ key]) {
      gameContainer.removeChild(treeElement[key])
      delete treeElement[key]
    }
  })
  
  allPlayersRef.on("value", (snapshot) => { 
    players = snapshot.val()
    let keys = Object.keys(players)
    playerOneKey = keys[0]
  })
  
  allAppleRef.on("value", snapshot => {
    let count = snapshot.numChildren()
    if (count == 0 && players[playerId].id === playerOneKey) {
      placeApple()
    }
  });
}


firebase.auth().onAuthStateChanged((user) => {
  
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  if (user) {
    //You're logged in!
    playerId = user.uid;
    playerRef = firebase.database().ref(`players/${playerId}`);

    const {x, y} = randomGridPosition();
    
    playerRef.set({
      id: playerId,
      snakeBody: [{x, y}],
      lostGame: false,
      color: getRandomColor(),
      score: 0,
      scoreAdded: false
    })



    
    //Remove me from Firebase when I diconnect
    playerRef.onDisconnect().remove() 

    //Begin the game now that we are signed in
    initGame();
  } else {
    //You're logged out.
  }
})

firebase.auth().signInAnonymously().catch((error) => {
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
  console.log(errorCode, errorMessage);
});