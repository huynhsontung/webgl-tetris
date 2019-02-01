import {initShaders} from "./Common/initShaders.js";
import {setBufferAndAttrib, setColorUniform, pickAShape} from "./helpers.js";
import { controlSwitch } from "./controls.js";

export var canvas;
export var gl;
export var buffer;
export var program;
const gridElementSize = 50; //px
const interval = 700; // ms ; the lower the value the faster the blocks move

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
	inactiveBlocks.forEach(block => {
		block.drawBlock();
	});
	shape.drawShape();
	if(finish){
		shape = null;
		// show overlay
		return;
	}
	window.requestAnimationFrame(render);
}

function initMatrix(){
	let matrix = [];
	// building matrix
	for (let i = 0; i < gridData.numVerticalBlocks; i++){
		let row = [];
		for(let j = 0; j < gridData.numHorizontalBlocks; j++){
			row.push(0);
		}
		matrix.push(row);
	}
	return matrix;
}

function collisionCheck(now){
	if(matrix.length === 0){
		matrix = initMatrix();
	}
	let activeBlocksCoor = shape.getBlockCoordinatesArray();	// getting coordinates of each block
	let collide = false;
	for(let i = 0; i< activeBlocksCoor.length; i++){
		let blockCoor = activeBlocksCoor[i];
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
			activeBlocksCoor.forEach(blockCoor => {
				if(blockCoor.x >= 0 && blockCoor.x < gridData.numHorizontalBlocks &&
					blockCoor.y >= 0 && blockCoor.y < gridData.numVerticalBlocks)
					matrix[blockCoor.y][blockCoor.x] = 1;
				else {
					finish = true;
				}
			});
			inactiveBlocks = inactiveBlocks.concat(shape.blockArray);
			shape = pickAShape();	// then pick a new shape
		}
		past = now;
	}
}

export function restartGame(){
	shape = null;
	inactiveBlocks = [];
	matrix = initMatrix();
	finish = false;
	window.requestAnimationFrame(render);
}