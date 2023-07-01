import { getKeyString } from "./gameMechanics.js";

export function drawTree(gameContainer, treeElement, allTreeRef) {
    allTreeRef.on("child_added", (snapshot) => {
      const tree = snapshot.val()
      
      const key = getKeyString(tree.x, tree.y);


      // Create the DOM Element
      const newTree = document.createElement('div')
      newTree.classList.add("Tree")
      newTree.innerHTML = `
      <img src="./images/tree.png" alt="hi"  width="40" height="40">
      `
      newTree.style.backgroundColor = tree.color

      
      // Position the Element
      newTree.style.gridRowStart =  tree.y
      newTree.style.gridColumnStart =  tree.x


      // Keep a reference for removal later and add to DOM
      treeElement[key] = newTree;
      gameContainer.appendChild(newTree)
    })
}

export function placeTree(x,y, players, playerId) {
    const key = getKeyString(x, y)
    const treeRef = firebase.database().ref(`tree/${key}`);
    const id = players[playerId].id
    const color = players[playerId].color
    treeRef.set({
      x,
      y,
      id,
      color,
    })
}

