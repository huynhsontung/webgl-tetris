import {setBufferAndAttrib, setColorUniform} from "./helpers.js";
import {gl, gridData} from "./tetris.js";

export class Block{
	constructor(color){
		let blockWidth = gridData.blockWidthNormalized;
		let blockHeight = gridData.blockHeightNormalized;
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

	drawBlock(){
		// draw fill
		let data = {
			rawData: new Float32Array(this.verticies),
			numOfComponents: 2,
			dataType: gl.FLOAT, 
			normalization: false
		};
		setBufferAndAttrib(data, "a_position");
		setColorUniform(this.color);
		gl.drawArrays(gl.TRIANGLES, 0, this.verticies.length/2);

		// draw outline
		data = {
			rawData: new Float32Array(this.outlineVerticies),
			numOfComponents: 2,
			dataType: gl.FLOAT, 
			normalization: false
		};
		setBufferAndAttrib(data, "a_position");
		let grey = 0;
		setColorUniform([grey,grey,grey,1]);
		gl.drawArrays(gl.LINE_LOOP, 0, this.outlineVerticies.length/2);
	}

	translate(x, y){
		for(let i= 0; i<this.verticies.length; i+=2){
			this.verticies[i] += x;
		}
		for(let i= 1; i<this.verticies.length; i+=2){
			this.verticies[i] += y;
		}

		for(let i= 0; i<this.outlineVerticies.length; i+=2){
			this.outlineVerticies[i] += x;
		}
		for(let i= 1; i<this.outlineVerticies.length; i+=2){
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
	
	getBlockCoordinates(){
		let middleX = gridData.numHorizontalBlocks / 2;
		let middleY = gridData.numVerticalBlocks / 2;
		let coorX = this.x / gridData.blockWidthNormalized;
		coorX = Math.round(coorX * 10)/10;
		let coorY = this.y / gridData.blockHeightNormalized - 1;
		coorY = Math.round(coorY * 10)/10;
		coorX += middleX;
		coorY += middleY;
		return {
			x: coorX,
			y: coorY
		};
	}
}