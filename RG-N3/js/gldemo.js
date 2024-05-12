$(document).ready(function() {

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
		//gl.bindAttribLocation(program, 0, "VertexPosition");// ne rabimo, že rešeno z layout location = 0 v kodi senčilnika

		var shaderInfo = gl.getProgramInfoLog(program);
		if (shaderInfo.length > 0) {
			alert("Program Info: " + shaderInfo);
		}
	}

	var bufferTrikotniki;
        var vaoTrikotniki;

	function GenCube(start = { x: 0, y: 0, z: 0 }, size = 0.25) {
		const x = start.x;
		const y = start.y;
		const z = start.z;

		return new Float32Array([
			// Prva ploskev (sprednja ploskev)
			x, y, z ,                   // Spodnje levo spredaj
			x,  y + size, z ,        // Zgornje levo spredaj
			x + size, y, z ,        // Spodnje desno spredaj
			x + size, y, z ,        // Spodnje desno spredaj
			x,  y + size, z ,        // Zgornje levo spredaj
			x + size,  y + size, z , // Zgornje desno spredaj

			// Druga ploskev (zadnja ploskev)
			x, y,  z + size ,        // Spodnje levo zadaj
			x,  y + size,  z + size , // Zgornje levo zadaj
			x + size, y,  z + size , // Spodnje desno zadaj
			x + size, y,  z + size , // Spodnje desno zadaj
			x,  y + size,  z + size , // Zgornje levo zadaj
			x + size,  y + size,  z + size , // Zgornje desno zadaj

			// Tretja ploskev (leva ploskev)
			x, y, z ,                   // Spodnje levo spredaj
			x,  y + size, z ,        // Zgornje levo spredaj
			x, y,  z + size ,        // Spodnje levo zadaj
			x, y,  z + size ,        // Spodnje levo zadaj
			x,  y + size, z ,        // Zgornje levo spredaj
			x,  y + size,  z + size , // Zgornje levo zadaj

			// Četrta ploskev (desna ploskev)
			x + size, y, z ,        // Spodnje desno spredaj
			x + size, y,  z + size , // Spodnje desno zadaj
			x + size,  y + size, z , // Zgornje desno spredaj
			x + size,  y + size, z ,     // Zgornje desno spredaj
			x + size, y,  z + size ,     // Spodnje desno zadaj
			x + size,  y + size,  z + size , // Zgornje desno zadaj

			// Peta ploskev (spodnja ploskev)
			x, y, z ,                   // Spodnje levo spredaj
			x + size, y, z ,        // Spodnje desno spredaj
			x, y,  z + size ,        // Spodnje levo zadaj
			x + size, y,  z + size , // Spodnje desno zadaj
			x, y,  z + size ,        // Spodnje levo zadaj
			x + size, y, z ,        // Spodnje desno spredaj

			// Šesta ploskev (zgornja ploskev)
			x,  y + size, z ,        // Zgornje levo spredaj
			x + size,  y + size, z , // Zgornje desno spredaj
			x,  y + size,  z + size , // Zgornje levo zadaj
			x + size,  y + size,  z + size , // Zgornje desno zadaj
			x,  y + size,  z + size ,      // Zgornje levo zadaj
			x + size,  y + size, z       // Zgornje desno spredaj
		]);
	}

	function constructGeometry() {
		// ustvari podatke za tla (koordinate oglišč, normale,
		// koordinate teksture)
		// lahko uporabiš constructSphere za generiranje krogle
		// ustvari bufferje na GPU in kopiraj podatke
		bufferTrikotniki = gl.createBuffer();
                vaoTrikotniki = gl.createVertexArray();
                gl.bindVertexArray(vaoTrikotniki);
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferTrikotniki);

		/*
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0 ]), gl.STATIC_DRAW);
                gl.enableVertexAttribArray(0);
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
		 */

		const Kocka1 = GenCube({ x: -0.7, y: -0.5, z: 0.0 }, 0.5);
		const Kocka2 = GenCube({ x: -0.15, y: -0.5, z: 0.0 }, 0.5);
		const Kocka3 = GenCube({ x: -0.5, y: 0.0, z: 0.0 }, 0.5);
		const Tla = new Float32Array([
			-1.0, -0.5, -1.0,   // sprednje levo oglišče
			1.0, -0.5, -1.0,    // sprednje desno oglišče
			-1.0, -0.5, 1.0,   // zadnje levo oglišče

			1.0, -0.5, -1.0,    // sprednje desno oglišče
			-1.0, -0.5, 1.0,   // zadnje levo oglišče
			1.0, -0.5, 1.0,    // zadnje desno oglišče

		]);

		gl.bufferData(gl.ARRAY_BUFFER, Kocka1.length*4*3+Tla.length*4, gl.STATIC_DRAW);

		gl.bufferSubData(gl.ARRAY_BUFFER, Kocka1.length*4 * 0, Kocka1);
		gl.bufferSubData(gl.ARRAY_BUFFER, Kocka1.length*4 * 1, Kocka2);
		gl.bufferSubData(gl.ARRAY_BUFFER, Kocka1.length*4 * 2, Kocka3);
		gl.bufferSubData(gl.ARRAY_BUFFER, Kocka1.length*4 * 3, Tla);

		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

	}

	var angleY = 0, angleX = 0;
	function setupInteraction(canvas) {
		canvas.onkeydown = function keyDown(event) {
			switch (event.keyCode) {
			case 37:
				angleY -= 10;
				break;
			case 39:
				angleY += 10;
				break;
			case 38:
				angleX -= 10;
				break;
			case 40:
				angleX += 10;
				break;
			default:
				// alert(event.keyCode);
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

		var PVM = glMatrix.mat4.identity(glMatrix.mat4.create());
		PVM = glMatrix.mat4.rotate(glMatrix.mat4.create(), PVM, glMatrix.glMatrix.toRadian(angleY), glMatrix.vec3.fromValues(0, 1, 0));
		PVM = glMatrix.mat4.rotate(glMatrix.mat4.create(), PVM, glMatrix.glMatrix.toRadian(angleX), glMatrix.vec3.fromValues(1, 0, 0));

		gl.uniformMatrix4fv(gl.getUniformLocation(program, "PVM"), false, PVM);
		//gl.bindVertexArray(vaoTrikotniki);

		gl.uniform4f(gl.getUniformLocation(program, "DodajBarvo") , 1.0, 0.0, 0.0, 1);
		gl.drawArrays(gl.TRIANGLES, 0, 3*12);

		gl.uniform4f(gl.getUniformLocation(program, "DodajBarvo") , 0.0, 1.0, 0.0, 1);
		gl.drawArrays(gl.TRIANGLES, 3*12, 3*12);

		gl.uniform4f(gl.getUniformLocation(program, "DodajBarvo") , 0.0, 0.0, 1.0, 1);
		gl.drawArrays(gl.TRIANGLES, 3*12*2, 3*12);

		gl.uniform4f(gl.getUniformLocation(program, "DodajBarvo") , 1.0, 1.0, 1.0, 1);
		gl.drawArrays(gl.TRIANGLES, 3*12*3, 3*4);

		var e = gl.getError();
		if (e) {
			alert("Draw error: " + e);
		}
	}

});
