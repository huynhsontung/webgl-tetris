import {initShaders} from "./Common/initShaders.js";
import {setBufferAndAttrib, setColorUniform, pickAShape} from "./helpers.js";

var canvas;
var gl;
var buffer;
var program;
const gridElementSize = 50; //px

window.onload = function init(){
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.clearColor(0,0,0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);


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

	buffer = setBufferAndAttrib(gl, program, buffer, gridDrawData, "a_position");
	let grey = 0.8;
	setColorUniform(gl, program, [grey, grey, grey, 1.0]);
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

var gridData;
var matrix = [];
var past = 0;
var shape;
var inactiveBlocks = [];

function render(now){
	gl.clear(gl.COLOR_BUFFER_BIT);
	gridData = drawGrid();
	if (!shape){
		shape = pickAShape(gl, canvas, buffer, program, gridData);		
	}
	calculateMatrix(now);
	inactiveBlocks.forEach(block => {
		block.drawBlock(gl, buffer, program);
	});
	shape.drawShape();
	window.requestAnimationFrame(render);
}

function calculateMatrix(now){
	if(matrix.length === 0){
		// building matrix
		for (let i = 0; i < gridData.numVerticalBlocks; i++){
			let row = [];
			for(let j = 0; j < gridData.numHorizontalBlocks; j++){
				row.push(0);
			}
			matrix.push(row);
		}
	}

	let activeBlocksCoor = shape.getBlockCoordinatesArray();
	let collide = false;
	for(let i = 0; i< activeBlocksCoor.length; i++){
		let blockCoor = activeBlocksCoor[i];
		if (blockCoor.y === 0 || matrix[blockCoor.y-1][blockCoor.x] === 1){
			collide = true;
			break;
		}
	}

	if(now - past >= 700){
		if(!collide){
			shape.translate(0, -gridData.blockHeightNormalized);
		} else {
			activeBlocksCoor.forEach(blockCoor => {
				matrix[blockCoor.y][blockCoor.x] = 1;
			});
			inactiveBlocks = inactiveBlocks.concat(shape.blockArray);
			shape = pickAShape(gl, canvas, buffer, program, gridData);
		}
		past = now;
	}
}