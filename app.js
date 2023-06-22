
let lastRenderTime = 0
let newSegments = 0
let SNAKE_SPEED = 5

let inputDirection = {x: 0, y:0}
let lastInputDirection = {x: 0, y:0}



let gameOver = false
  //Misc Helpers
  
  function getKeyString(x, y) {
    return `${x}x${y}`;
  }
  
  
  
  function isSolid(x,y) {
  
    const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
    return (
      blockedNextSpace ||
      x >= mapData.maxX ||
      x < mapData.minX ||
      y >= mapData.maxY ||
      y < mapData.minY
    )
  }
  
  function getRandomNumberBetween() {
    let newFoodPosition
    while (newFoodPosition == null) {
        newFoodPosition = randomGridPosition()
    }
    return newFoodPosition
}
  
function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * 21) + 1,
    y: Math.floor(Math.random() * 21) + 1
  }
}
  
  (function () {
  
    let playerId;
    let playerRef;
    let players = {};
    let playerElements = {};
    let apple = {}
    let tree = {}
    let appleElement = {}
    let treeElement = {}
    let playerOneKey


    function placeApple() {
      const { x, y } = randomGridPosition();
      const key = getKeyString(x, y)
      const appleRef = firebase.database().ref(`apple/${key}`);
      appleRef.set({
        x,
        y,
      })
    }

    function placeTree(x,y) {
      const key = getKeyString(x, y)
      const treeRef = firebase.database().ref(`tree/${key}`);
      const id = players[playerId].id
      treeRef.set({
        x,
        y,
        id,
      })

    }


    function checkIfAPlayerLostGame() {
      let lostOrWon = []
      Object.keys(players).forEach((key) => {
        let player = players[key]
        lostOrWon.push(player)
      })

      return lostOrWon
    }

    function checkifLostOrWon(winOrLose) {
      let bool
      if (winOrLose.lostGame) {
        bool = true
      } else {
        bool = false
      }
      return bool
    }

    
  
    const gameContainer = document.getElementById('game-board')
  
    function attemptGrabApple(x, y) {
      const key = getKeyString(x, y);
      if (apple) {
        if (apple[key]) {
          // Remove this key from data, then uptick Player's apple count and expand snake by 2 and add a tree
          firebase.database().ref(`apple`).remove();
          expandSnake(2)
          score.textContent = parseInt(score.textContent) + 1
          placeTree(x,y)

        }
      }
    }

    function hitTree(x, y) {
      const key = getKeyString(x, y);
      if (tree[key] && tree[key].id !== players[playerId].id) {
        // Remove this key from data, then uptick Player's apple count and expand snake by 2 and add a tree
        firebase.database().ref(`tree`).remove();
        playerRef.update({
          lostGame: true
        })
        playerRef.set(players[playerId])
      }
    }
    

    
    
    function addSegements() {
      for (let i = 0; i < newSegments; i++) {
        players[playerId].snakeBody.push({...players[playerId].snakeBody[players[playerId].snakeBody.length - 1]})
      }

      newSegments = 0
    }
  
    function updateSnake() {
      
      if (players[playerId]) {
        addSegements()
      
        const inputDirection = getInputDirection()
        for (let i = players[playerId].snakeBody.length - 2; i >= 0; i--) {
          players[playerId].snakeBody[i + 1] = {...players[playerId].snakeBody[i]}
        }

        players[playerId].snakeBody[0].x += inputDirection.x;
        players[playerId].snakeBody[0].y += inputDirection.y;

        playerRef.set(players[playerId]);



        attemptGrabApple(players[playerId].snakeBody[0].x, players[playerId].snakeBody[0].y)
        if (tree) {
          hitTree(players[playerId].snakeBody[0].x, players[playerId].snakeBody[0].y)
        }
      }
      
    }

    function snakeIntersection () {
      if (players[playerId]) {
         return onSnake(players[playerId].snakeBody[0], {ignoreHead: true})
      }
    }


    function onSnake(position, {ignoreHead = false} = {}) {
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

    function outsideGrid(position) {
      if (players[playerId]) {
        return (
          position.x < 1 || position.x > 21 ||
          position.y < 1 || position.y > 21
        )
      }
      
    }

    function getSnakeHead() {
      if (players[playerId]) {
        return players[playerId].snakeBody[0]
      }
    }

    function getInputDirection () {
      lastInputDirection = inputDirection
      return inputDirection
    }

    function isCollision(pos1, pos2) {
      return pos1.x === pos2.x && pos1.y === pos2.y
    }

    function expandSnake(amount) {
      newSegments += amount
    }
  
    function initGame() {
      
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
  
      const allPlayersRef = firebase.database().ref(`players`);
      const allAppleRef = firebase.database().ref(`apple`);
      const allTreeRef = firebase.database().ref(`tree`)

      allPlayersRef.on("value", (snapshot) => {
        //Fires whenever a change occurs
        players = snapshot.val() || {};
      })
      
      function main(currentTime) {
        if (gameOver || checkIfAPlayerLostGame().some(checkifLostOrWon)) {
          checkIfAPlayerLostGame().forEach((key) => {
            if (key.id === playerId) {
              if (key.lostGame) {
                setTimeout(() => {
                  allAppleRef.remove()
                  allTreeRef.remove()
                  window.location.reload()
                }, 2000)
                
              } 

              if (!key.lostGame) {
                
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
        updateSnake()
        checkDeath()
      }

      function draw() {
          gameContainer.innerHTML = ''
          drawSnake()
          drawApple()
          drawTree()
      }

      function checkDeath() {
        if (outsideGrid(getSnakeHead()) || snakeIntersection() ){
          playerRef.update({
            lostGame: true
          })


          gameOver = outsideGrid(getSnakeHead()) || snakeIntersection()      
        }
      }

      function drawSnake() {
          Object.keys(players).forEach((key) => {
            const characterState = players[key];

            characterState.snakeBody.forEach(segment => {
              const addedCharacterElement = document.createElement('div')
              addedCharacterElement.style.gridRowStart = segment.y
              addedCharacterElement.style.gridColumnStart = segment.x
              addedCharacterElement.classList.add('Character')
              playerElements[key] = addedCharacterElement;

              gameContainer.appendChild(addedCharacterElement);
            })
          })
      }
  
      //Remove character DOM element after they leave
      allPlayersRef.on("child_removed", (snapshot) => {

        const removedKey = snapshot.val().id;
        if (playerElements[removedKey]) {
          gameContainer.removeChild(playerElements[removedKey]);
          delete playerElements[removedKey];
        }
      })
  
  
      //New - not in the video!
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
    
      function drawApple() {
        allAppleRef.on("child_added", (snapshot) => {
          const apple = snapshot.val()

          
          const key = getKeyString(apple.x, apple.y);

    
          // Create the DOM Element
          const newApple = document.createElement('div')
          newApple.classList.add("Apple")
          
          // Position the Element
          newApple.style.gridRowStart =  apple.y
          newApple.style.gridColumnStart =  apple.x
    

          // Keep a reference for removal later and add to DOM
          appleElement[key] = newApple;
          gameContainer.appendChild(newApple)
        })
      }

      function drawTree() {
        allTreeRef.on("child_added", (snapshot) => {
          const tree = snapshot.val()
          
          const key = getKeyString(tree.x, tree.y);

    
          // Create the DOM Element
          const newTree = document.createElement('div')
          newTree.classList.add("Tree")
          
          // Position the Element
          newTree.style.gridRowStart =  tree.y
          newTree.style.gridColumnStart =  tree.x
    

          // Keep a reference for removal later and add to DOM
          treeElement[key] = newTree;
          gameContainer.appendChild(newTree)
        })
      }
      
      allPlayersRef.on("value", (snapshot) => { 
        players = snapshot.val()
        playerCount = snapshot.numChildren()
        let keys = Object.keys(players)
        playerOneKey = keys[0]
      })

      
      allAppleRef.on("value", snapshot => {
        count = snapshot.numChildren()
        if (count == 0 && players[playerId].id === playerOneKey) {
          placeApple()
        }
      });
    }

    
  
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        //You're logged in!
        playerId = user.uid;
        playerRef = firebase.database().ref(`players/${playerId}`);
        allPlayersRef = firebase.database().ref(`players`);


        
        const {x, y} = randomGridPosition();
        
        
        playerRef.set({
          id: playerId,
          snakeBody: [{x, y}],
          lostGame: false
        })

       
        //Remove me from Firebase when I diconnect
        playerRef.onDisconnect().remove(() => {
          allPlayersRef.on("child_removed", (snapshot) => {
            count = snapshot.numChildren()
            if (count == 1) {
              firebase.database().ref(`apple`).remove();
            }
          });
        })
        

  
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
  
  
  })();
  