import {ShapeO, ShapeI, ShapeS, ShapeZ, ShapeL, ShapeJ, ShapeT} from "./shape.js";
import {gl, buffer, program, gridData} from "./tetris.js";
// const dataTemplate = {
//     rawData: any,
//     numOfComponents: any,
//     dataType: any, 
//     normalization: boolean
// }

export function setBufferAndAttrib(dataSource, attribName){
	if(!buffer){
		let buffer = gl.createBuffer();
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
	return buffer;
}

export function setColorUniform(colorData){
	var uniform = gl.getUniformLocation(program, "u_color");
	gl.uniform4f(uniform, colorData[0], colorData[1], colorData[2], colorData[3]);
}

export function pickAShape(){
	let shape;
	switch(Math.floor(Math.random() * Math.floor(7))){
	case 0: 
		shape = new ShapeO(orange);
		break;
	case 1:
		shape = new ShapeI(red);
		break;
	case 2:
		shape = new ShapeS(blue);
		break;
	case 3: 
		shape = new ShapeZ(green);
		break;
	case 4:
		shape = new ShapeL(yellow);
		break;
	case 5:
		shape = new ShapeJ(purple);
		break;
	default: 
		shape = new ShapeT(teal);
		break;
	}
	let translateY = (gridData.numVerticalBlocks / 2 + 1) * gridData.blockHeightNormalized;
	shape.translate(0, translateY);
	return shape;
}

const green = [60/255, 180/255, 75/255, 1];
const blue = [67/255, 99/255, 216/255, 1];
const red = [230/255, 25/255, 75/255, 1];
const orange = [245/255, 130/255, 49/255, 1];
const yellow = [1,1, 25/255, 1];
const purple = [145/255, 30/255, 180/255, 1];
const teal = [70/255, 153/255, 144/255, 1];