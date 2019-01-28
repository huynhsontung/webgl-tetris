import {setBufferAndAttrib} from "./tetris.js";

export class Shape{
	constructor(gl, canvas, buffer, program, gridData){
		this.gl = gl;
		this.canvas = canvas;
		this.buffer = buffer;
		this.program = program;
		this.gridData = gridData;
		this.verticies = [];
	}
	
	drawShape(){
		let gl = this.gl;
		let program = this.program;
		let buffer = this.buffer;
		let verticies = this.verticies;
		let data = {
			rawData: new Float32Array(verticies),
			numOfComponents: 2,
			dataType: gl.FLOAT, 
			normalization: false
		};
		setBufferAndAttrib(gl, program, buffer, data, "a_position");
		gl.drawArrays(gl.TRIANGLES, 0, verticies.length/2);
	}

	addBlock(translationX, translationY, blockWidth, blockHeight){
		var verticies = [
			0,0,
			blockWidth, 0,
			blockWidth, -blockHeight,
			0,0,
			blockWidth, -blockHeight,
			0, -blockHeight
		];
		for(let i= 0; i<12; i+=2){
			verticies[i] += translationX;
		}
		for(let i= 1; i<12; i+=2){
			verticies[i] += translationY;
		}
		return verticies;
	}

}

export class ShapeO extends Shape{
	constructor(gl, canvas, buffer, program, gridData){
		super(gl, canvas, buffer, program, gridData);
		this.matrix = [
			1, 1,
			1, 1,
		];
		this.verticies = [];
		let blockWidth = gridData.blockWidthNormalized;
		let blockHeight = gridData.blockHeightNormalized;
		this.verticies = this.verticies.concat(this.addBlock(0,0, blockWidth, blockHeight));
		this.verticies = this.verticies.concat(this.addBlock(blockWidth,0, blockWidth, blockHeight));
		this.verticies = this.verticies.concat(this.addBlock(blockWidth, -blockHeight, blockWidth, blockHeight));
		this.verticies = this.verticies.concat(this.addBlock(0, -blockHeight, blockWidth, blockHeight));
	}
}

