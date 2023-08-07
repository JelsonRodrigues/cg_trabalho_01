"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLUtils = exports.gl = void 0;
class gl {
    // Vertex Array Objects
    constructor(canva, vsSource, fsSource) {
        this.gl = canva.getContext("webgl2");
        this.program = gl.createProgram(this.gl, gl.createShader(this.gl, WebGL2RenderingContext.VERTEX_SHADER, vsSource), gl.createShader(this.gl, WebGL2RenderingContext.FRAGMENT_SHADER, fsSource));
        this.a_position = this.gl.getAttribLocation(this.program, "position");
        this.a_uv_text_coord = this.gl.getAttribLocation(this.program, "a_uv_text_coord");
        this.u_model = this.gl.getUniformLocation(this.program, "model");
        this.u_view = this.gl.getUniformLocation(this.program, "view");
        this.u_projection = this.gl.getUniformLocation(this.program, "projection");
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.buffer_triangle_vertices = this.gl.createBuffer();
        this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_triangle_vertices);
        this.gl.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, new Float32Array([
            -1.0, -0.0, 0.6,
            0.0, 0.6, 0.4,
            1.0, 0.0, 0.6,
        ]), WebGL2RenderingContext.STATIC_DRAW);
    }
    drawTriangle(model, view, projection) {
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_triangle_vertices);
        this.gl.enableVertexAttribArray(this.a_position);
        this.gl.vertexAttribPointer(this.a_position, 3, WebGL2RenderingContext.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.uniformMatrix4fv(this.u_model, false, model);
        this.gl.uniformMatrix4fv(this.u_view, false, view);
        this.gl.uniformMatrix4fv(this.u_projection, false, projection);
        this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
        this.gl.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
    }
    static createShader(gl, type, source) {
        const shader = gl.createShader(type);
        if (shader) {
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success) {
                return shader;
            }
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
        return null;
    }
    static createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        if (program) {
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            const success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }
            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }
        return null;
    }
}
exports.gl = gl;
var WebGLUtils;
(function (WebGLUtils) {
    WebGLUtils.sleep = (ms = 0.0) => new Promise(r => setTimeout(r, ms));
    function readFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(filePath);
            const text = yield response.text();
            return text;
        });
    }
    WebGLUtils.readFile = readFile;
    /** @todo Read file in small chunks, preferable using something like 64 or 256 lines at time */
    function readObj(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj_content = yield readFile(filePath);
            const vertexArray = new Array();
            const colorArray = new Array();
            const vertexTextCoordArray = new Array();
            const facesIndex = new Array();
            obj_content.split("\n").map((line) => {
                let elements = line.split(" ");
                if (elements[0] == 'v') {
                    for (let index = 1; index < elements.length; ++index) {
                        const number = parseFloat(elements[index]);
                        vertexArray.push(number);
                    }
                }
                else if (elements[0] == 'c') {
                    for (let index = 1; index < elements.length; ++index) {
                        const number = parseFloat(elements[index]);
                        colorArray.push(number);
                    }
                }
                else if (elements[0] == 'vt') {
                    for (let index = 1; index < elements.length; ++index) {
                        const number = parseFloat(elements[index]);
                        vertexTextCoordArray.push(number);
                    }
                }
                else if (elements[0] == 'f') {
                    for (let index = 1; index < elements.length; ++index) {
                        const values = elements[index].split('/');
                        for (let number = 0; number < values.length; ++number) {
                            const number = parseInt(elements[index]);
                            facesIndex.push(number);
                        }
                    }
                }
            });
            return [vertexArray, colorArray, vertexTextCoordArray, facesIndex];
        });
    }
    WebGLUtils.readObj = readObj;
})(WebGLUtils || (exports.WebGLUtils = WebGLUtils = {}));
exports.default = WebGLUtils;
