import {initShaders} from "./Common/initShaders.js";
import {setBufferAndAttrib, setColorUniform, pickAShape} from "./helpers.js";
import { controlSwitch } from "./controls.js";

export var canvas;
export var gl;
export var buffer;
export var program;
var requestAnimation;
var score = 0;
const scoreStep = 100;
const gridElementSize = 50; //px
const interval = 500; // ms ; the lower the value the faster the blocks move

window.onload = function init(){
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.clearColor(0,0,0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	document.addEventListener("keydown", controlSwitch);

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	render();
};

function drawGrid(){
	let verticies = [];

	let numHorizontalBlocks = Math.floor(canvas.width / gridElementSize);
	if(canvas.width % gridElementSize == 0){
		numHorizontalBlocks--;
	}
	let numVerticalBlocks = Math.floor(canvas.height / gridElementSize);
	if(canvas.height % gridElementSize == 0){
		numVerticalBlocks--;
	}

	let blockWidthNormalized = 2 * gridElementSize / canvas.width;
	let blockHeightNormalized = 2 * gridElementSize / canvas.height;
	let rightMargin = blockWidthNormalized * numHorizontalBlocks/2;
	let leftMargin = -rightMargin;
	let topMargin = blockHeightNormalized * numVerticalBlocks /2;
	let bottomMargin = -topMargin;

	for(let i = 0; i <= numHorizontalBlocks; i++){
		let xPos = leftMargin + blockWidthNormalized * i;
		verticies.push(xPos, topMargin);
		verticies.push(xPos, bottomMargin);
	}

	for(let i = 0; i <= numVerticalBlocks; i++){
		let yPos = bottomMargin + blockHeightNormalized * i;
		verticies.push(leftMargin, yPos);
		verticies.push(rightMargin, yPos);
	}

	let gridDrawData = {
		rawData: new Float32Array(verticies),
		numOfComponents: 2,
		dataType: gl.FLOAT,
		normalization: false
	};

	buffer = setBufferAndAttrib(gridDrawData, "a_position");
	let grey = 0.8;
	setColorUniform([grey, grey, grey, 1.0]);
	gl.drawArrays(gl.LINES, 0, (numHorizontalBlocks + numVerticalBlocks + 2)*2);
	return {
		numHorizontalBlocks,
		numVerticalBlocks,
		blockWidthNormalized,
		blockHeightNormalized,
		rightMargin,
		leftMargin,
		topMargin,
		bottomMargin,
	};
}

export var gridData;
export var matrix = [];
export var shape;
var past = 0;
var inactiveBlocks = [];
var finish = false;

function render(now){
	gl.clear(gl.COLOR_BUFFER_BIT);
	gridData = drawGrid();
	if (!shape){
		shape = pickAShape();		
	}
	collisionCheck(now);
	fullRowCheck();
	document.getElementById("score").textContent = score;
	inactiveBlocks.forEach(blockArray => {
		blockArray.forEach(block => {
			block.drawBlock();
		});
	});
	if(finish){
		gameOver();
		return;
	}
	shape.drawShape();
	requestAnimation = window.requestAnimationFrame(render);
}

function initMatrix(){
	matrix = [];
	inactiveBlocks = [];
	// building matrix
	for (let i = 0; i < gridData.numVerticalBlocks; i++){
		inactiveBlocks.push([]);
		let row = [];
		for(let j = 0; j < gridData.numHorizontalBlocks; j++){
			row.push(0);
		}
		matrix.push(row);
	}
}

// perform collision check with inactive blocks and game boundaries
function collisionCheck(now){
	if(matrix.length === 0){
		initMatrix();
	}
	let activeBlocksCoor = shape.getBlockCoordinatesArray();	// getting coordinates of each block
	let collide = false;
	for(let i = 0; i< activeBlocksCoor.length; i++){
		let blockCoor = activeBlocksCoor[i];
		if (blockCoor.y > gridData.numVerticalBlocks){
			continue;
		}
		if (blockCoor.y === 0 || matrix[blockCoor.y-1][blockCoor.x] === 1){
			collide = true;
			break;
		}
	}

	if(now - past >= interval){
		if(!collide){
			// if not collide then keep going down by 1 block
			shape.translate(0, -gridData.blockHeightNormalized);
		} else {
			// if collide then save each block into matrix and add them to inactive blocks
			shape.blockArray.forEach(block => {
				let blockCoor = block.getBlockCoordinates();
				if(blockCoor.x >= 0 && blockCoor.x < gridData.numHorizontalBlocks &&
					blockCoor.y >= 0 && blockCoor.y < gridData.numVerticalBlocks){
					matrix[blockCoor.y][blockCoor.x] = 1;
					inactiveBlocks[blockCoor.y].push(block);
				}
			});
			if(inactiveBlocks[gridData.numVerticalBlocks-1].length > 0){
				finish = true;
			} else {
				shape = pickAShape();
			}
		}
		past = now;
	}
	return collide;
}

// check if any row needs to be cleared
function fullRowCheck(){
	let rowsToRemove = [];
	matrix.forEach((row, index) => {
		let wholeLine = true;
		if (row[0] === 0) {
			return;
		} else {
			for (let i = 1; i < row.length; i++){
				if (row[i] === 0) {
					wholeLine = false;
					break;
				}
			}
			if(wholeLine){
				rowsToRemove.push(index);
			}
		}
	});
	rowsToRemove.forEach(rowIndex => {
		matrix.splice(rowIndex,1);
		let row = [];
		for(let j = 0; j < gridData.numHorizontalBlocks; j++){
			row.push(0);
		}
		matrix.push(row);
		inactiveBlocks.splice(rowIndex,1);
		for(let i = rowIndex; i < gridData.numVerticalBlocks - 1; i++){
			inactiveBlocks[i].forEach(block => block.translate(0, -gridData.blockHeightNormalized));
		}
		inactiveBlocks.push([]);

		score += scoreStep;
	});
}

function gameOver(){
	shape = null;
	document.getElementById("overlay-content").textContent = "Game Over";
	document.getElementById("overlay").style.display = "block";
	window.cancelAnimationFrame(requestAnimation);
}

export function restartGame(){
	score = 0;
	shape = null;
	initMatrix();
	finish = false;
	document.getElementById("overlay").style.display = "none";
	window.requestAnimationFrame(render);
}

var isPaused = false;
export function pauseGame(){
	document.getElementById("overlay-content").textContent = "Paused";
	if(!isPaused){
		isPaused = true;
		document.getElementById("overlay").style.display = "block";
		window.cancelAnimationFrame(requestAnimation);
	} else {
		isPaused = false;
		document.getElementById("overlay").style.display = "none";
		requestAnimation = window.requestAnimationFrame(render);
	}
}