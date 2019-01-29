import {setBufferAndAttrib, setColorUniform} from "./tetris.js";

class Shape{
	constructor(gl, canvas, buffer, program, gridData, color){
		this.gl = gl;
		this.canvas = canvas;
		this.buffer = buffer;
		this.program = program;
		this.gridData = gridData;
		this.color = color || [0.1,0.1,0.1,1];

		this.x = 0;
		this.y = 0;
	}
	
	drawShape(){
		this.blockArray.forEach((block) => {
			block.drawBlock(this.gl, this.buffer, this.program);
		});
	}

	translate(x, y){
		this.x = x;
		this.y = y;
		this.blockArray.forEach((block) => {
			block.translate(x,y);
		});
	}
}

export class ShapeO extends Shape{
	constructor(gl, canvas, buffer, program, gridData, color){
		super(gl, canvas, buffer, program, gridData, color);
		this.matrix = [
			1, 1,
			1, 1,
		];
		let blockWidth = gridData.blockWidthNormalized;
		let blockHeight = gridData.blockHeightNormalized;
		
		this.blockArray = [
			new Block(blockWidth, blockHeight, this.color),
			new Block(blockWidth, blockHeight, this.color),
			new Block(blockWidth, blockHeight, this.color),
			new Block(blockWidth, blockHeight, this.color)
		];
		this.blockArray[0].translate(-blockWidth, blockHeight);
		this.blockArray[1].translate(0, blockHeight);
		this.blockArray[2].translate(-blockWidth, 0);
		this.blockArray[3].translate(0, 0);
	}
}

class Block{
	constructor(blockWidth, blockHeight, color){
		this.x = 0;
		this.y = 0;
		this.color = color;
		// fill the block
		let verticies = [
			0,0,
			blockWidth, 0,
			blockWidth, -blockHeight,
			0,0,
			blockWidth, -blockHeight,
			0, -blockHeight
		];

		this.verticies = verticies;
		// outline the block
		let outlineVerticies = [
			0,0,
			blockWidth, 0,
			blockWidth, -blockHeight,
			0, -blockHeight
		];

		this.outlineVerticies = outlineVerticies;
	}

	drawBlock(gl, buffer, program){
		// draw fill
		let data = {
			rawData: new Float32Array(this.verticies),
			numOfComponents: 2,
			dataType: gl.FLOAT, 
			normalization: false
		};
		setBufferAndAttrib(gl, program, buffer, data, "a_position");
		setColorUniform(gl, program, this.color);
		gl.drawArrays(gl.TRIANGLES, 0, this.verticies.length/2);

		// draw outline
		data = {
			rawData: new Float32Array(this.outlineVerticies),
			numOfComponents: 2,
			dataType: gl.FLOAT, 
			normalization: false
		};
		setBufferAndAttrib(gl, program, buffer, data, "a_position");
		let grey = 0;
		setColorUniform(gl, program, [grey,grey,grey,1]);
		gl.drawArrays(gl.LINE_LOOP, 0, this.outlineVerticies.length/2);
	}

	translate(x, y){
		for(let i= 0; i<12; i+=2){
			this.verticies[i] += x;
		}
		for(let i= 1; i<12; i+=2){
			this.verticies[i] += y;
		}

		for(let i= 0; i<8; i+=2){
			this.outlineVerticies[i] += x;
		}
		for(let i= 1; i<8; i+=2){
			this.outlineVerticies[i] += y;
		}

		this.x += x;
		this.y += y;
	}

	setPosition(x, y){
		let translateX = x - this.x;
		let translateY = y - this.y;

		for(let i= 0; i<12; i+=2){
			this.verticies[i] += translateX;
		}
		for(let i= 1; i<12; i+=2){
			this.verticies[i] += translateY;
		}

		for(let i= 0; i<8; i+=2){
			this.outlineVerticies[i] += translateX;
		}
		for(let i= 1; i<8; i+=2){
			this.outlineVerticies[i] += translateY;
		}

		this.x = x;
		this.y = y;
	}
}