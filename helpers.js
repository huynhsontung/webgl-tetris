import {ShapeO} from "./shape.js";
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
	return buffer;
}

export function setColorUniform(gl, program, colorData){
	var uniform = gl.getUniformLocation(program, "u_color");
	gl.uniform4f(uniform, colorData[0], colorData[1], colorData[2], colorData[3]);
}

export function pickAShape(gl, canvas, buffer, program, gridData){
	let shape;
	switch(Math.floor(Math.random() * Math.floor(7))){
	default: 
		shape = new ShapeO(gl, canvas, buffer, program, gridData, [0.4,0.2,0.6,1]);
	}
	let translateY = (gridData.numVerticalBlocks / 2) * gridData.blockHeightNormalized;
	shape.translate(0, translateY);
	return shape;
}