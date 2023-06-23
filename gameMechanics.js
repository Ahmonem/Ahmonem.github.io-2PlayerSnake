export function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * 21) + 1,
    y: Math.floor(Math.random() * 21) + 1
  }
}

export function getRandomNumberBetween() {
    let newFoodPosition
    while (newFoodPosition == null) {
        newFoodPosition = randomGridPosition()
    }
    return newFoodPosition
}

export function getKeyString(x, y) {
    return `${x}x${y}`;
}

export function isCollision(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y
}

export function outsideGrid(position, players, playerId) {
    if (players[playerId]) {
      return (
        position.x < 1 || position.x > 21 ||
        position.y < 1 || position.y > 21
      )
    }
    
}

export function checkIfAPlayerLostGame(players) {
    let lostOrWon = []
    Object.keys(players).forEach((key) => {
      let player = players[key]
      lostOrWon.push(player)
    })

    return lostOrWon
}

export function checkifLostOrWon(winOrLose) {
    let bool
    if (winOrLose.lostGame) {
      bool = true
    } else {
      bool = false
    }
    return bool
}
