import {initShaders} from "./Common/initShaders.js";
import {ShapeO} from "./shape.js";

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

	setBufferAndAttrib(gl, program, buffer, gridDrawData, "a_position");
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
// var matrix = [];

// function calculateMatrix(gridData, shapeData){
// 	if(matrix.length === 0){
// 		// building matrix
// 		for (let i = 0; i < gridData.numVerticalBlocks; i++){
// 			let row = [];
// 			for(let j = 0; j < gridData.numHorizontalBlocks; j++){
// 				row.push(0);
// 			}
// 			matrix.push(row);
// 		}
// 	}

// }

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT);
	gridData = drawGrid();
	// calculateMatrix(gridData);
	let shapeO = new ShapeO(gl, canvas, buffer, program, gridData);
	let translateX = (gridData.numHorizontalBlocks / 2 - 1)  * gridData.blockWidthNormalized;
	let translateY = (gridData.numVerticalBlocks / 2 - 1) * gridData.blockHeightNormalized;
	shapeO.translate(translateX, translateY);
	shapeO.drawShape();
	window.requestAnimationFrame(render);
}

// const dataTemplate = {
//     rawData: any,
//     numOfComponents: any,
//     dataType: any, 
//     normalization: boolean
// }

export function setBufferAndAttrib(gl, program, buffer,  dataSource, attribName){
	if(!buffer){
		buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, dataSource.rawData, gl.STATIC_DRAW);
		let attrib = gl.getAttribLocation(program, attribName);
		gl.vertexAttribPointer(attrib, dataSource.numOfComponents, dataSource.dataType, dataSource.normalization, 0, 0);
		gl.enableVertexAttribArray(attrib);
	} else {
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, dataSource.rawData);
		let attrib = gl.getAttribLocation(program, attribName);
		gl.vertexAttribPointer(attrib, dataSource.numOfComponents, dataSource.dataType, dataSource.normalization, 0, 0);
	}
}

export function setColorUniform(gl, program, colorData){
	var uniform = gl.getUniformLocation(program, "u_color");
	gl.uniform4f(uniform, colorData[0], colorData[1], colorData[2], colorData[3]);
}
