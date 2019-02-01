import {shape, matrix, gridData, restartGame} from "./tetris.js";

export function controlSwitch(event){
	switch (event.code){
	case "ArrowLeft":
		moveLeft();
		break;
	case "ArrowRight":
		moveRight();
		break;
	case "ArrowDown":
		moveDown();
		break;
	case "ArrowUp":
		rotate();
		break;
	case "KeyR":
		restart();
		break;
	}
}

function moveRight(){
	if (shape == null)
		return;
	let activeBlocksCoor = shape.getBlockCoordinatesArray();
	for(let i = 0; i < activeBlocksCoor.length; i++){
		if (activeBlocksCoor[i].x >= gridData.numHorizontalBlocks - 1)
			return;
		if(activeBlocksCoor[i].y >= gridData.numHorizontalBlocks)
			continue;
		if(matrix[activeBlocksCoor[i].y][activeBlocksCoor[i].x + 1] ===  1)
			return;
	}
	shape.translate(gridData.blockWidthNormalized, 0);
}

function moveLeft(){
	if (shape == null)
		return;
	let activeBlocksCoor = shape.getBlockCoordinatesArray();
	for(let i = 0; i < activeBlocksCoor.length; i++){
		if(activeBlocksCoor[i].x <= 0)
			return;
		if(activeBlocksCoor[i].y >= gridData.numHorizontalBlocks)
			continue;
		if(matrix[activeBlocksCoor[i].y][activeBlocksCoor[i].x - 1] ===  1)
			return;
	}
	shape.translate(-gridData.blockWidthNormalized, 0);
}

function moveDown(){
	if (shape == null)
		return;
	let activeBlocksCoor = shape.getBlockCoordinatesArray();
	for(let i = 0; i < activeBlocksCoor.length; i++){
		if(activeBlocksCoor[i].y <= 0)
			return;
		if(activeBlocksCoor[i].y > gridData.numHorizontalBlocks)
			continue;
		if(matrix[activeBlocksCoor[i].y - 1][activeBlocksCoor[i].x] ===  1)
			return;
	}
	shape.translate(0, -gridData.blockHeightNormalized);
}

function rotate(){
	if (shape == null)
		return;
	let blockArrayCopy = shape.blockArray.concat([]);
	let collide = false;
	blockArrayCopy.forEach(block => {
		let localX = (block.x - shape.x) / gridData.blockWidthNormalized;
		let localY = (block.y - shape.y) / gridData.blockHeightNormalized;
		let tmp = Math.round(localX*10)/10;
		localX = -Math.round(localY*10)/10;
		localY = tmp;
		localY += 1;
		// localX += gridData.numHorizontalBlocks/2;
		// localY += gridData.numVerticalBlocks/2;
		let translateX = shape.x + localX * gridData.blockWidthNormalized;
		let translateY = shape.y + localY * gridData.blockHeightNormalized;
		block.setPosition(translateX, translateY);
		let blockCoor = block.getBlockCoordinates(gridData);
		if(blockCoor.x < 0 || blockCoor.x >= gridData.numHorizontalBlocks || blockCoor.y < 0){
			collide = true;
			return;
		} else if (matrix[blockCoor.y][blockCoor.x] === 1){
			collide = true;
			return;
		}
	});
	if (!collide){
		shape.blockArray = blockArrayCopy;
	}
}

function restart(){
	restartGame();
}