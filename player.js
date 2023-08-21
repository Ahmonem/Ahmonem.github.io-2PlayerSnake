import { isCollision } from "./gameMechanics.js";
import { getKeyString } from "./gameMechanics.js";
import { placeTree } from "./tree.js";

let newSegments = 0
let inputDirection = {x: 0, y:0}
let lastInputDirection = {x: 0, y:0}
let pickedColors = []
let scoreBoard = []
export function randomFromArray() {
  return Math.floor(Math.random() * 7) 
}

export function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function drawSnake(players, gameContainer, playerElements, playerId) {
    Object.keys(players).forEach((key) => {
      const characterState = players[key];
      if (pickedColors.length < Object.keys(players).length) {
        console.log(characterState)
        if (characterState.color == null) {
          characterState.color = Math.floor(Math.random()*16777215).toString(16);
          console.log(characterState.color)
        }
        else {
          console.log(characterState.color, "not null")
        }
        pickedColors.push(characterState.color)
      }
        
      if (playerId == key) {
        const playerScore = document.createElement('div')
        playerScore.style.left = "500px"
        playerScore.id = key
        playerScore.className = "score"
        playerScore.textContent = characterState.score
        playerScore.style.color = characterState.color
        playerScore.style.backgroundColor = "grey"
        if (document.getElementById(key)) {
          document.getElementById(key).remove()
        }
        document.body.appendChild(playerScore)
        scoreBoard.push(playerScore.id)
      }
      else {
        const playerScore = document.createElement('div')
        playerScore.style.left = "500px"
        playerScore.id = key
        playerScore.className = "score"
        playerScore.textContent = characterState.score
        playerScore.style.color = characterState.color
        playerScore.style.backgroundColor = "grey"
        if (document.getElementById(key)) {
          document.getElementById(key).remove()
        }
        document.body.appendChild(playerScore)
        scoreBoard.push(playerScore.id)
      }
      
      characterState.snakeBody.forEach(segment => {
        const addedCharacterElement = document.createElement('div')
        addedCharacterElement.style.gridRowStart = segment.y
        addedCharacterElement.style.gridColumnStart = segment.x
        addedCharacterElement.style.backgroundColor = characterState.color
        addedCharacterElement.classList.add('Character')
        playerElements[key] = addedCharacterElement;

        gameContainer.appendChild(addedCharacterElement);
      })

    })
}

export function initialzePlayerMovement() {
  window.addEventListener("keydown",  e => {
    switch(e.key) {
        case "w":
            if (lastInputDirection.y !== 0) break
            inputDirection = {x : 0, y: -1}
            break
        case "s":
            if (lastInputDirection.y !== 0) break
            inputDirection = {x: 0, y: 1}
            break
        case "a":
            if (lastInputDirection.x !== 0) break
            inputDirection = {x: -1, y: 0}
            break
        case "d":
            if (lastInputDirection.x !== 0) break
            inputDirection = {x: 1, y: 0}
            break
    }
  })
}

export function expandSnake(amount) {
    newSegments += amount
}

export function getSnakeHead(players, playerId) {
    if (players[playerId]) {
      return players[playerId].snakeBody[0]
    }
}

export function onSnake(position, {ignoreHead = false} = {}, players, playerId) {
  if (players[playerId]) {
    return players[playerId].snakeBody.some((segment, index) => {
      if (ignoreHead && index === 0) return false
      if (isCollision(segment, position)) {
        players[playerId].lostGame = true
      }
      return isCollision(segment, position)
    })
  }
}

export function snakeIntersection(players, playerId) {
  if (players[playerId]) {
      return onSnake(players[playerId].snakeBody[0], {ignoreHead: true}, players, playerId)
  }
}

export function getInputDirection() {
  lastInputDirection = inputDirection
  return inputDirection
}

export function updateSnake(players, playerId, playerRef, tree, apple) {
    if (players[playerId]) {
      addSegments(players, playerId)

      inputDirection = getInputDirection()
      
      for (let i = players[playerId].snakeBody.length - 2; i >= 0; i--) {
        players[playerId].snakeBody[i + 1] = {...players[playerId].snakeBody[i]}
      }

      players[playerId].snakeBody[0].x += inputDirection.x;
      players[playerId].snakeBody[0].y += inputDirection.y;

      playerRef.set(players[playerId]);

      attemptGrabApple(players[playerId].snakeBody[0].x, players[playerId].snakeBody[0].y, apple, players, playerId, playerRef)
      
      if (tree) {
        hitTree(players[playerId].snakeBody[0].x, players[playerId].snakeBody[0].y, players, playerId, playerRef, tree)
      }
      let score = document.getElementById(playerId)
      if (score) {
        score.textContent = players[playerId].score
      }  
      
    }
}

export function addSegments(players, playerId) {

    for (let i = 0; i < newSegments; i++) {
      players[playerId].snakeBody.push({...players[playerId].snakeBody[players[playerId].snakeBody.length - 1]})
    }

    newSegments = 0
}

export function attemptGrabApple(x, y, apple, players, playerId, playerRef) {
  const key = getKeyString(x, y);
  if (apple) {
    if (apple[key]) {
      firebase.database().ref(`apple`).remove();
      expandSnake(2)
      playerRef.update({
        score: players[playerId].score + 1
      })
      
      placeTree(x,y, players, playerId)
    }
  }
}

export function hitTree(x, y, players, playerId, playerRef, tree) {
  const key = getKeyString(x, y);
  if (tree[key] && tree[key].id !== players[playerId].id) {
    firebase.database().ref(`tree`).remove();
    playerRef.update({
      lostGame: true
    })

    console.log(playerRef, "playerRef")
  }
}