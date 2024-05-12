$(document).ready(function () {

    var gl = null;

    function initWebGL(canvas) {
        var msg = "";
        try {
            gl = canvas.getContext("webgl2");
        } catch (e) {
            msg = "Error creating WebGL context: " + e.toString();
        }
        // če to ne deluje, je potrebno ustvariti context "webgl", torej brez 2

        if (!gl) {
            alert(msg);
            throw new Error(msg);
        }
    }

    var program;

    function initShaders() {
        // ustvari in prevedi senčilnike
        // nastavi konstantne uniform spremenljivke
        program = gl.createProgram();

        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, $("#simple-vs").text());
        gl.compileShader(vs);
        gl.attachShader(program, vs);
        var shaderInfo = gl.getShaderInfoLog(vs);
        if (shaderInfo.length > 0) {
            alert("VShader Info: " + shaderInfo);
        }

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, $("#simple-fs").text());
        gl.compileShader(fs);
        gl.attachShader(program, fs);
        var shaderInfo = gl.getShaderInfoLog(fs);
        if (shaderInfo.length > 0) {
            alert("FShader Info: " + shaderInfo);
        }

        gl.linkProgram(program);

        var shaderInfo = gl.getProgramInfoLog(program);
        if (shaderInfo.length > 0) {
            alert("Program Info: " + shaderInfo);
        }
    }

    var bufferTrikotniki;
    var vaoTrikotniki;

    function GenCube(start = {x: 0, y: 0, z: 0}, size = 0.25) {
        const x = start.x;
        const y = start.y;
        const z = start.z;

        return new Float32Array([
            // Prva ploskev (sprednja ploskev)
            x, y, z,                   // Spodnje levo spredaj
            x, y + size, z,        // Zgornje levo spredaj
            x + size, y, z,        // Spodnje desno spredaj
            x + size, y, z,        // Spodnje desno spredaj
            x, y + size, z,        // Zgornje levo spredaj
            x + size, y + size, z, // Zgornje desno spredaj

            // Druga ploskev (zadnja ploskev)
            x, y, z + size,        // Spodnje levo zadaj
            x, y + size, z + size, // Zgornje levo zadaj
            x + size, y, z + size, // Spodnje desno zadaj
            x + size, y, z + size, // Spodnje desno zadaj
            x, y + size, z + size, // Zgornje levo zadaj
            x + size, y + size, z + size, // Zgornje desno zadaj

            // Tretja ploskev (leva ploskev)
            x, y, z,                   // Spodnje levo spredaj
            x, y + size, z,        // Zgornje levo spredaj
            x, y, z + size,        // Spodnje levo zadaj
            x, y, z + size,        // Spodnje levo zadaj
            x, y + size, z,        // Zgornje levo spredaj
            x, y + size, z + size, // Zgornje levo zadaj

            // Četrta ploskev (desna ploskev)
            x + size, y, z,        // Spodnje desno spredaj
            x + size, y, z + size, // Spodnje desno zadaj
            x + size, y + size, z, // Zgornje desno spredaj
            x + size, y + size, z,     // Zgornje desno spredaj
            x + size, y, z + size,     // Spodnje desno zadaj
            x + size, y + size, z + size, // Zgornje desno zadaj

            // Peta ploskev (spodnja ploskev)
            x, y, z,                   // Spodnje levo spredaj
            x + size, y, z,        // Spodnje desno spredaj
            x, y, z + size,        // Spodnje levo zadaj
            x + size, y, z + size, // Spodnje desno zadaj
            x, y, z + size,        // Spodnje levo zadaj
            x + size, y, z,        // Spodnje desno spredaj

            // Šesta ploskev (zgornja ploskev)
            x, y + size, z,        // Zgornje levo spredaj
            x + size, y + size, z, // Zgornje desno spredaj
            x, y + size, z + size, // Zgornje levo zadaj
            x + size, y + size, z + size, // Zgornje desno zadaj
            x, y + size, z + size,      // Zgornje levo zadaj
            x + size, y + size, z       // Zgornje desno spredaj
        ]);
    }

    function constructGeometry() {
        bufferTrikotniki = gl.createBuffer();
        vaoTrikotniki = gl.createVertexArray();
        gl.bindVertexArray(vaoTrikotniki);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferTrikotniki);

        const Kocka = GenCube({x: 0.0, y: 0.0, z: 0.0}, 0.125);

        gl.bufferData(gl.ARRAY_BUFFER, Kocka.length * 4, gl.STATIC_DRAW);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, Kocka);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

    }

    const cubePositions = [
        glMatrix.vec3.fromValues(0.0, 0.125, 0.0),

        glMatrix.vec3.fromValues(0.0625, 0.0, 0.0625),
        glMatrix.vec3.fromValues(0.0625, 0.0, -0.0625),
        glMatrix.vec3.fromValues(-0.0625, 0.0, 0.0625),
        glMatrix.vec3.fromValues(-0.0625, 0.0, -0.0625),

        glMatrix.vec3.fromValues(0.0, -0.125, 0.0),
        glMatrix.vec3.fromValues(0.0, -0.125, 0.125),
        glMatrix.vec3.fromValues(0.0, -0.125, -0.125),
        glMatrix.vec3.fromValues(0.125, -0.125, 0.0),
        glMatrix.vec3.fromValues(0.125, -0.125, 0.125),
        glMatrix.vec3.fromValues(0.125, -0.125, -0.125),
        glMatrix.vec3.fromValues(-0.125, -0.125, 0.0),
        glMatrix.vec3.fromValues(-0.125, -0.125, 0.125),
        glMatrix.vec3.fromValues(-0.125, -0.125, -0.125),

        //Tla
        glMatrix.vec3.fromValues(-0.07, -13, -0.07)
    ];

    var cubeColors = new Array(15);
    for (var i = 0; i < 14; i++) {
        cubeColors[i] = [Math.random(), Math.random(), Math.random()];
    }
    cubeColors[14] = [1, 1, 1];


    var projectionType = 1, scaleKoefficient = 1;
    var angleY = 0, angleX = 0, moveX = 0, moveY = 0, moveZ = 0;

    function setupInteraction(canvas) {
        canvas.onkeydown = function keyDown(event) {
            switch (event.keyCode) {
                //Rotacija
                case 37: //L
                    angleY += 10;
                    break;
                case 39: //R
                    angleY -= 10;
                    break;
                case 38: //U
                    angleX += 10;
                    break;
                case 40: //D
                    angleX -= 10;
                    break;

                //Premikanje
                case 83: //S
                    moveZ += 0.1;
                    break;
                case 87: //W
                    moveZ -= 0.1;
                    break;
                case 65: //A
                    moveX -= 0.1;
                    break;
                case 68: //D
                    moveX += 0.1;
                    break;

                case 81: //Q
                    moveY -= 0.1;
                    break;
                case 69: //E
                    moveY += 0.1;
                    break;

                //Projekcija
                case 80: //P
                    if (projectionType === 0) {
                        projectionType = 1;
                    } else {
                        projectionType = 0;
                    }
                    break;

                default:
                // alert(event.keyCode);
            }
        };

        canvas.onwheel = function wheel(event) {
            if (event.deltaY > 0) { // Scroll down
                if (scaleKoefficient < 2) {
                    scaleKoefficient += 0.1;
                }
            } else { // Scroll up
                if (scaleKoefficient > 0.1) {
                    scaleKoefficient -= 0.1;
                }
            }
        };

        canvas.tabIndex = 1000;
        canvas.focus();
    }

    var myCanvas = document.getElementById("myCanvas");
    initWebGL(myCanvas);

    initShaders();
    constructGeometry();
    setupInteraction(myCanvas);

    gl.clearColor(0.3, 0.2, 0.7, 1);

    var e = gl.getError();
    if (e) {
        alert("Init error: " + e);
    }

    setInterval(drawLoop, 33);

    function drawLoop() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(program);

        // nastavi viewport
        //za naslednjo nalogo nastavi projekcijo in kamero
        /*var proj_matrix = glMatrix.mat4.perspective(glMatrix.mat4.create(), glMatrix.glMatrix.toRadian(80), myCanvas.width / myCanvas.height, 0.1, 1000);

        var model_matrix=glMatrix.mat4.identity(glMatrix.mat4.create());

        model_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), model_matrix, glMatrix.vec3.fromValues(0, 0, -2));
        model_matrix = glMatrix.mat4.rotate(glMatrix.mat4.create(), model_matrix, glMatrix.glMatrix.toRadian(angleY), glMatrix.vec3.fromValues(0, 1, 0));
        model_matrix = glMatrix.mat4.rotate(glMatrix.mat4.create(), model_matrix, glMatrix.glMatrix.toRadian(angleX), glMatrix.vec3.fromValues(1, 0, 0));

        var view_matrix = glMatrix.mat4.identity(glMatrix.mat4.create());
        view_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), view_matrix, glMatrix.vec3.fromValues(0, 0, -2));

        var PVM = glMatrix.mat4.multiply(glMatrix.mat4.create(), proj_matrix, glMatrix.mat4.multiply(glMatrix.mat4.create(), view_matrix, model_matrix));
        */

        /*
        var PVM = glMatrix.mat4.identity(glMatrix.mat4.create());
        PVM = glMatrix.mat4.rotate(glMatrix.mat4.create(), PVM, glMatrix.glMatrix.toRadian(angleY), glMatrix.vec3.fromValues(0, 1, 0));
        PVM = glMatrix.mat4.rotate(glMatrix.mat4.create(), PVM, glMatrix.glMatrix.toRadian(angleX), glMatrix.vec3.fromValues(1, 0, 0));
        */

        if (projectionType) {
            var proj_matrix = glMatrix.mat4.perspective(glMatrix.mat4.create(), glMatrix.glMatrix.toRadian(80), myCanvas.width / myCanvas.height, 0.1, 1000);
        } else {
            var proj_matrix = glMatrix.mat4.ortho(glMatrix.mat4.create(), -0.6, 0.6, -0.6, 0.6, 0.1, 1000);
        }

        //var proj_matrix = glMatrix.mat4.perspective(glMatrix.mat4.create(), glMatrix.glMatrix.toRadian(80), myCanvas.width / myCanvas.height, 0.1, 1000);
        var view_matrix = glMatrix.mat4.identity(glMatrix.mat4.create());
        view_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), view_matrix, glMatrix.vec3.fromValues(-0.1, 0, 1));

        for (var i = 0; i < 14; i++) {
            var model_matrix = glMatrix.mat4.identity(glMatrix.mat4.create());
            model_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), model_matrix, glMatrix.vec3.fromValues(0, 0, -2));
            model_matrix = glMatrix.mat4.rotate(glMatrix.mat4.create(), model_matrix, glMatrix.glMatrix.toRadian(angleY), glMatrix.vec3.fromValues(0, 1, 0));
            model_matrix = glMatrix.mat4.rotate(glMatrix.mat4.create(), model_matrix, glMatrix.glMatrix.toRadian(angleX), glMatrix.vec3.fromValues(1, 0, 0));
            //Korak skaliranje
            model_matrix = glMatrix.mat4.scale(model_matrix, model_matrix, glMatrix.vec3.fromValues(scaleKoefficient, scaleKoefficient, scaleKoefficient));

            //Premikanje kocke
            var translation_matrix = glMatrix.vec3.add(glMatrix.vec3.create(), cubePositions[i], glMatrix.vec3.fromValues(moveX, moveY, moveZ));
            model_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), model_matrix, translation_matrix);

            //Mnozenje vseh komponent
            var PVM = glMatrix.mat4.multiply(glMatrix.mat4.create(), proj_matrix, glMatrix.mat4.multiply(glMatrix.mat4.create(), view_matrix, model_matrix));

            gl.uniformMatrix4fv(gl.getUniformLocation(program, "PVM"), false, PVM);
            gl.uniform4f(gl.getUniformLocation(program, "DodajBarvo"), cubeColors[i][0], cubeColors[i][1], cubeColors[i][2], 1);
            gl.drawArrays(gl.TRIANGLES, 0, 3 * 12);
        }

        //Tla (i = 14)
        model_matrix = glMatrix.mat4.identity(glMatrix.mat4.create());
        model_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), model_matrix, glMatrix.vec3.fromValues(0, 0, -2));
        //Korak Rotiranje
        model_matrix = glMatrix.mat4.rotate(glMatrix.mat4.create(), model_matrix, glMatrix.glMatrix.toRadian(angleY), glMatrix.vec3.fromValues(0, 1, 0));
        model_matrix = glMatrix.mat4.rotate(glMatrix.mat4.create(), model_matrix, glMatrix.glMatrix.toRadian(angleX), glMatrix.vec3.fromValues(1, 0, 0));
        //Korak skaliranje
        model_matrix = glMatrix.mat4.scale(model_matrix, model_matrix, glMatrix.vec3.fromValues(-5, 0.01, -5));
        model_matrix = glMatrix.mat4.scale(model_matrix, model_matrix, glMatrix.vec3.fromValues(1, scaleKoefficient, 1));
        //Premikanje kocke
        translation_matrix = glMatrix.vec3.add(glMatrix.vec3.create(), cubePositions[14], glMatrix.vec3.fromValues(-moveX, moveY, -moveZ));
        model_matrix = glMatrix.mat4.translate(glMatrix.mat4.create(), model_matrix, translation_matrix);

        //Mnozenje vseh komponent
        PVM = glMatrix.mat4.multiply(glMatrix.mat4.create(), proj_matrix, glMatrix.mat4.multiply(glMatrix.mat4.create(), view_matrix, model_matrix));

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "PVM"), false, PVM);
        gl.uniform4f(gl.getUniformLocation(program, "DodajBarvo"), cubeColors[14][0], cubeColors[14][1], cubeColors[14][2], 1);
        gl.drawArrays(gl.TRIANGLES, 0, 3 * 12);

        var e = gl.getError();
        if (e) {
            alert("Draw error: " + e);
        }
    }
});
