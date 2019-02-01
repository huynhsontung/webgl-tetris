import {Block} from "./block.js";
import {gridData} from "./tetris.js";
// gridData{
// 	numHorizontalBlocks,
// 	numVerticalBlocks,
// 	blockWidthNormalized,
// 	blockHeightNormalized,
// 	rightMargin,
// 	leftMargin,
// 	topMargin,
// 	bottomMargin,
// }

class Shape{
	constructor(color){
		this.color = color || [0.1,0.1,0.1,1];

		this.x = 0;
		this.y = 0;
	}
	
	drawShape(){
		this.blockArray.forEach((block) => {
			block.drawBlock();
		});
	}

	translate(x, y){
		this.x += x;
		this.y += y;
		this.blockArray.forEach((block) => {
			block.translate(x,y);
		});
	}

	getBlockCoordinatesArray(){
		let blockCoorArray = [];
		this.blockArray.forEach(block => {
			blockCoorArray.push(block.getBlockCoordinates());
		});
		return blockCoorArray;
	}
}

export class ShapeO extends Shape{
	constructor(color){
		super(color);
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

