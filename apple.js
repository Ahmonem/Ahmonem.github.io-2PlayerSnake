import { getKeyString, randomGridPosition } from "./gameMechanics.js";

export function drawApple(appleElement, gameContainer, allAppleRef) {
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

export function placeApple() {
    let { x, y } = randomGridPosition();
    let key = getKeyString(x, y)
    const allTreeRef = firebase.database().ref(`tree`);
    const allPlayersRef = firebase.database().ref(`players`);

    let allTreeLocations = []
    let allPlayerLocations = []

    allPlayersRef.on("value", () => {
      allPlayersRef.on("child_added", (snapshot) => {
        for(let i = 0; i < snapshot.val().snakeBody.length; i++) {
          allPlayerLocations.push((snapshot.val().snakeBody[i].x).toString() + 'x' + (snapshot.val().snakeBody[i].y).toString())
        }
      })
    })
    
    allTreeRef.on("child_added", (snapshot) => {
      allTreeLocations.push((snapshot.val().x).toString() + 'x' + (snapshot.val().y).toString())
    })
    
    function checkKey(keyValue) {
      if (keyValue === key) {
        return true
      }
    }

    if (allTreeLocations.some(checkKey) || allPlayerLocations.some(checkKey)) {
      ({ x , y } = randomGridPosition())
      key = getKeyString(x, y)
      console.log("location rerolled")
    }

    const appleRef = firebase.database().ref(`apple/${key}`);
    appleRef.set({
      x,
      y,
    })
}