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
}

function drawGrid(){
    var verticies = [];

    var numHorizontalBlocks = Math.floor(canvas.width / gridElementSize);
    if(canvas.width % gridElementSize == 0){
        numHorizontalBlocks--;
    }
    var numVerticalBlocks = Math.floor(canvas.height / gridElementSize);
    if(canvas.height % gridElementSize == 0){
        numVerticalBlocks--;
    }

    var horiGridSizeNormalized = 2 * gridElementSize / canvas.width;
    var vertGridSizeNormalized = 2 * gridElementSize / canvas.height;
    var rightMargin = horiGridSizeNormalized * numHorizontalBlocks/2;
    var leftMargin = -rightMargin;
    var topMargin = vertGridSizeNormalized * numVerticalBlocks /2;
    var bottomMargin = -topMargin;

    for(var i = 0; i <= numHorizontalBlocks; i++){
        let xPos = leftMargin + horiGridSizeNormalized * i;
        verticies.push(xPos, topMargin);
        verticies.push(xPos, bottomMargin);
    }

    for(var i = 0; i <= numVerticalBlocks; i++){
        let yPos = bottomMargin + vertGridSizeNormalized * i;
        verticies.push(leftMargin, yPos);
        verticies.push(rightMargin, yPos);
    }

    var gridData = {
        rawData: new Float32Array(verticies),
        numOfComponents: 2,
        dataType: gl.FLOAT,
        normalization: false
    }

    setBufferAndAttrib(gl, program, buffer, gridData, "a_position");
    let grey = 0.8;
    setColorUniform(gl, program, [grey, grey, grey, 1.0]);
    gl.drawArrays(gl.LINES, 0, (numHorizontalBlocks + numVerticalBlocks + 2)*2);
    return {
        horiGridSizeNormalized,
        vertGridSizeNormalized,
        rightMargin,
        leftMargin,
        topMargin,
        bottomMargin,
    }
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawGrid();
    window.requestAnimationFrame(render);
}

// const dataTemplate = {
//     rawData: any,
//     numOfComponents: any,
//     dataType: any, 
//     normalization: boolean
// }

function setBufferAndAttrib(gl, program, buffer,  dataSource, attribName){
    if(!buffer){
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, dataSource.rawData, gl.STATIC_DRAW);
        var attrib = gl.getAttribLocation(program, attribName);
        gl.vertexAttribPointer(attrib, dataSource.numOfComponents, dataSource.dataType, dataSource.normalization, 0, 0);
        gl.enableVertexAttribArray(attrib);
    } else {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, dataSource.rawData);
        var attrib = gl.getAttribLocation(program, attribName);
        gl.vertexAttribPointer(attrib, dataSource.numOfComponents, dataSource.dataType, dataSource.normalization, 0, 0);
    }
}

function setColorUniform(gl, program, colorData){
    var uniform = gl.getUniformLocation(program, "u_color");
    gl.uniform4f(uniform, colorData[0], colorData[1], colorData[2], colorData[3]);
}
