import { isCollision } from "./gameMechanics.js";
import { getKeyString } from "./gameMechanics.js";
import { placeTree } from "./tree.js";

let newSegments = 0
let inputDirection = {x: 0, y:0}
let lastInputDirection = {x: 0, y:0}
let pickedColors = []
let scoreBoard = []
let paused = false
let mainMenu = true
let InstructionsInfo = false
const openMenuButtons = document.querySelectorAll('[data-menu-target]')
const closeMenuButtons = document.querySelectorAll('[data-close-button]')
const closeMainMenuButtons = document.querySelectorAll('[data-main-target]')
const openMainMenuButtons = document.querySelectorAll('[data-open-target]')
const openInstructionsButton = document.querySelectorAll('[data-info-target]')
const overlay = document.getElementById('overlay')

openMenuButtons.forEach(button => {
  button.addEventListener('click', () => {
    const menu = document.querySelector(button.dataset.menuTarget)
    openMenu(menu)
  })
})

closeMenuButtons.forEach(button => {
  button.addEventListener('click', () => {
    const menu = button.closest('.menu')
    closeMenu(menu)
  })
})

closeMainMenuButtons.forEach(button => {
  button.addEventListener('click', () => {
    const menu = document.querySelector('.mainmenu.active')
    closeMainMenu(menu)
  })
})

openMainMenuButtons.forEach(button => {
  button.addEventListener('click', () => {
    const menu = document.querySelector('.mainmenu')
    openMainMenu(menu)
  })
})

openInstructionsButton.forEach(button => {
  button.addEventListener('click', () => {
    const menu = document.querySelector('.InstructionsInfo') || document.querySelector('.InstructionsInfo.active')
    if (!InstructionsInfo) { 
      openInstructionsInfo(menu)
      InstructionsInfo = true
    }
    else {
      closeInstructionsInfo(menu)
      InstructionsInfo = false
    }
  })
})

function openInstructionsInfo(menu) {
  if (menu == null) return
  menu.classList.add('active')
}

function closeInstructionsInfo(menu) {
  if (menu == null) return
  menu.classList.remove('active')
}

function openMenu(menu) {
  if (menu == null) return
  menu.classList.add('active')
  overlay.classList.add('active')
  inputDirection = {x: 0, y:0}
  paused = true
}

function closeMenu(menu) {
  if (menu == null) return
  menu.classList.remove('active')
  overlay.classList.remove('active')
  inputDirection = lastInputDirection
  paused = false
}

function closeMainMenu(menu) {
  if (menu == null) return
  menu.classList.remove('active')
  document.querySelector('.maintitle.active').classList.remove('active')
  document.querySelector('.playButton.active').classList.remove('active')
  const titles = document.querySelectorAll('.span1.active')
  titles.forEach(title => {
    title.classList.remove('active')
    title.classList.add('hidden')
  })
  inputDirection = lastInputDirection
  paused = false
  mainMenu = false
}

function openMainMenu(menu) {
  if (menu == null) return
  menu.classList.add('active')
  document.querySelector('.maintitle').classList.add('active')
  document.querySelector('.playButton').classList.add('active')
  overlay.classList.remove('active')
  document.querySelector('.menu.active').classList.remove('active')
  const titles = document.querySelectorAll('.span1')
  titles.forEach(title => {
    title.classList.add('active')
    title.classList.remove('hidden')
  })
  inputDirection = {x: 0, y:0}
  paused = true
  mainMenu = true
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

export function drawSnake(players, gameContainer, playerElements, playerId, characterScores) {
  Object.keys(players).forEach((key) => {
    const characterState = players[key];
    if (characterState.color == null) {
      characterState.color = getRandomColor()
      // console.log(characterState.color, "Other Player:",key, "Current Player:", playerId)
    }
    else {
      // console.log(characterState.color, "not null", "Other Player:", key, "Current Player:", playerId)
    }
    pickedColors.push(characterState.color)
    
    characterScores.sort(function(a, b) {
      return parseFloat(b.score) - parseFloat(a.score);
    });

    if (playerId == key) {
      const playerScore = document.createElement('div')

      // console.table(characterScores)
      characterScores.forEach((object, index) => {
        if (object.key == playerId) {
          if (index == 0) {
            playerScore.style.top = "32px"
            // console.log(object.key, ":", index, playerScore.style.top, object.score)
          }
          else if(index == 1) {
            playerScore.style.top = "64px"
            // console.log(object.key, ":", index, playerScore.style.top, object.score)
          }
        }
        else {
            var otherPlayerScore = document.getElementById(object.key)
            if (otherPlayerScore) {
              if (index == 0) {
                otherPlayerScore.style.top = "32px"
                // console.log(object.key, ":", index, otherPlayerScore.style.top, object.score, "32")
              }
              else if(index == 1) {
                otherPlayerScore.style.top = "64px"
                // console.log(object.key, ":", index, otherPlayerScore.style.top, object.score, "64")
              }
            }
            else {
              // console.error("Other Player Doesnt Exist")
            }
          };
      })
      playerScore.id = key
      playerScore.className = "score"
      playerScore.textContent = characterState.score
      playerScore.style.color = characterState.color
      if (document.getElementById(key)) {
        document.getElementById(key).remove()
      }
      document.body.appendChild(playerScore)
      scoreBoard.push(playerScore.id)
    }
    else {
      const playerScore = document.createElement('div')
      playerScore.id = key
      playerScore.className = "score"
      playerScore.textContent = characterState.score
      playerScore.style.color = characterState.color
      
      if (document.getElementById(key)) {
        document.getElementById(key).remove()
      }
      document.body.appendChild(playerScore)
      scoreBoard.push(playerScore.id)
    }
    
    characterState.snakeBody.forEach((segment, index)=> {
      const addedCharacterElement = document.createElement('div')
      addedCharacterElement.style.gridRowStart = segment.y
      addedCharacterElement.style.gridColumnStart = segment.x
      if (playerId == key && index == 0) {
        addedCharacterElement.textContent = "You"
      }
      let playerRef = firebase.database().ref(`players/${key}`)
      let localPlayer = {}
      playerRef.on("value", (snapshot) => {
        //Fires whenever a change occurs
        localPlayer = snapshot.val() || {}
        if (localPlayer.color) {
          addedCharacterElement.style.backgroundColor = localPlayer.color
          // console.log("1", localPlayer.color, key)
        }
        else{
          addedCharacterElement.style.backgroundColor = characterState.score
          // console.log("2", characterState.score, key)
        }
      })
      addedCharacterElement.classList.add('Character')
      playerElements[key] = addedCharacterElement;
      gameContainer.appendChild(addedCharacterElement);
    })

    for (let i = 1; i < 22; i++) {
      for (let j = 1; j < 22; j++) {
        if (i%2 == 0) {
          if (j%2 == 0) {
            const evenColor = document.createElement('div')
            evenColor.style.gridRowStart = i
            evenColor.style.gridColumnStart = j
            evenColor.classList.add('evenColor')
            gameContainer.appendChild(evenColor);
          }
        }
        else {
          if (!(j%2 == 0)) {
            const oddColor = document.createElement('div')
            oddColor.style.gridRowStart = i
            oddColor.style.gridColumnStart = j
            oddColor.classList.add('oddColor')
            gameContainer.appendChild(oddColor);
          }
        }
      }
    }

  })
}

export function initialzePlayerMovement() {
  window.addEventListener("keydown",  e => {
    switch(e.key.toLowerCase()) {
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

export function onSnake(position, {ignoreHead = false} = {}, players, playerId, playerPositions, playerRef) {
  if (players[playerId]) {
    playerPositions.forEach((object) => {
      return object.snakeBody.some((segment, index) => {
        if (ignoreHead && index === 0) return false
        if (isCollision(segment, position)) {
          players[playerId].lostGame = true
          playerRef.update({
            lostGame: true
          })
        }
        return isCollision(segment, position)
      })
    })
  }
}

export function snakeIntersection(players, playerId, playerPositions, playerRef) {
  if (players[playerId]) {
      return onSnake(players[playerId].snakeBody[0], {ignoreHead: true}, players, playerId, playerPositions, playerRef)
  }
}

export function getInputDirection() {
  lastInputDirection = inputDirection
  return inputDirection
}

export function updateSnake(players, playerId, playerRef, tree, apple) {
    if (players[playerId] && !paused && !mainMenu) {
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
      var audio = new Audio('./audio/appleEat.mp3');
      audio.play();
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
    var audio = new Audio('./audio/Lost.mp3');
    audio.play();
    console.log(playerRef, "playerRef")
  }
}