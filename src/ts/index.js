"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glm = __importStar(require("gl-matrix"));
const gl_1 = require("./gl");
const Spline_1 = require("../modules/Spline");
const vertexShader_glsl_1 = __importDefault(require("../shaders/vertexShader.glsl"));
const fragmentShader_glsl_1 = __importDefault(require("../shaders/fragmentShader.glsl"));
const CubicBezierCurve_1 = require("../modules/CubicBezierCurve");
const F_1 = require("./F");
var gl_handler;
var spline;
var objects = new Array();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Try read a OBJ
        const obj_data = gl_1.WebGLUtils.readObj("./objects/pyramid.obj");
        spline = new Spline_1.Spline(30);
        const curve = new CubicBezierCurve_1.CubicBezierCurve([-10.0, 0.0, -10.0], [-5.0, -5.0, -30.0], [5.0, -5.0, -30.0], [0.0, 0.0, 10.0]);
        const curve2 = new CubicBezierCurve_1.CubicBezierCurve([0.0, 0.0, 10.0], [0.0, 10.0, 5.0], [5.0, 15.0, -5.0], [1.0, 5.0, -10.0]);
        const curve3 = new CubicBezierCurve_1.CubicBezierCurve([1.0, 5.0, -10.0], [-10.0, 6.0, -5.0], [-6.0, 7.0, 5.0], [5.0, 4.0, -5.0]);
        spline.addCurve(curve);
        spline.addCurve(curve2);
        spline.addCurve(curve3);
        spline.sampleSpline();
        // Get canvas
        const canva = document.getElementById("mainCanvas");
        canvasResize(canva);
        const vsSource = vertexShader_glsl_1.default;
        const fsSource = fragmentShader_glsl_1.default;
        gl_handler = new gl_1.gl(canva, vsSource, fsSource);
        const spline_points = new Array();
        spline.array_points.forEach((vec) => {
            spline_points.push(vec[0]);
            spline_points.push(vec[1]);
            spline_points.push(vec[2]);
        });
        gl_handler.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, gl_handler.buffer_control_points);
        gl_handler.gl.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, new Float32Array(spline_points), WebGL2RenderingContext.STATIC_DRAW);
        gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
        gl_handler.gl.viewport(0, 0, canva.width, canva.height);
        objects.push(new F_1.F(gl_handler.gl));
        start = Date.now();
        animateTiangle();
    });
}
function setupEventHandlers() {
}
function canvasResize(canva) {
    const widht = window.innerWidth;
    const height = window.innerHeight - 50;
    canva.width = widht;
    canva.height = height;
    canva.style.width = `${widht}px`;
    canva.style.height = `${height}px`;
}
var full_rotation = 10000;
var start = Date.now();
var period_walk = 5000;
const canva = document.getElementById("mainCanvas");
// Create perspective matrix
const field_of_view = Math.PI / 4.0;
const near = 0.1;
const far = 1000;
const aspect_ratio = canva.width / canva.height;
const perspective = glm.mat4.create();
glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);
function animateTiangle() {
    const now = Date.now();
    const percent_animation = ((now - start) / full_rotation) % 1.0;
    const angle = Math.PI * 2 * percent_animation;
    // // Create model matrix
    const model = glm.mat4.create();
    glm.mat4.identity(model);
    glm.mat4.scale(model, model, [1.0 / 30.0, -1.0 / 30.0, 1.0 / 30.0]);
    objects[0].model = model;
    // glm.mat4.translate(model, model, [Math.sin(angle/2) * 300, 0.0, 0.0]);
    // Create view matrix
    const radius = 10.0;
    // const camera_position_in_world : glm.vec3 = [Math.cos(angle) * radius, 0.0, Math.sin(angle) * radius];
    const location_spline = spline.getPoint(percent_animation);
    const looking_at_tangent = spline.getPointTangent(percent_animation);
    glm.vec3.normalize(looking_at_tangent, looking_at_tangent);
    glm.vec3.add(looking_at_tangent, looking_at_tangent, location_spline);
    const camera_position_in_world = [location_spline[0], location_spline[1], location_spline[2]];
    const up_position = [0.0, 1.0, 0.0];
    // const look_at : glm.vec3 = looking_at_tangent;
    // const camera_position_in_world : glm.vec3 = [20, 3, 15];
    // const up_position : glm.vec3 = [0.0, 1.0, 0.0];
    const look_at = glm.vec3.transformMat4(glm.vec3.create(), [0, 0, 0], model); // Look at the F
    // const look_at : glm.vec3 = [0,0,0];
    const camera = glm.mat4.create();
    glm.mat4.lookAt(camera, camera_position_in_world, look_at, up_position);
    // A funcao lookAt cria a camera a funcao targetTo cria a matriz da camera
    // Uma e o inverso da outra, inverso(lookAt) == targetTo && lookAt == inverso(targetTo)
    // Para fazer um objeto olhar para outro, usa-se a targetTo, para criar a camera, que possui
    // a posicao do olho, up vector ... e depois a mudanca de base usa-se a lookAt
    // Por algum motivo a inversa nao e igual a transposta, deveria. Mas pode ser que os vetores que 
    // eu estou inserindo nao sao normalizados e/ou ortogonais??
    // gl_handler.drawTriangle(model, camera, perspective);
    gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
    objects.forEach((drawable_obj) => {
        if (drawable_obj.draw !== undefined) {
            drawable_obj.draw(gl_handler.gl, camera, perspective);
        }
        else {
            console.log("DRAW E UNDEFINED");
            return;
        }
    });
    /* Draw the Control points */
    glm.mat4.identity(model);
    gl_handler.drawControlPoints(spline.array_points.length, model, camera, perspective);
    requestAnimationFrame(animateTiangle);
}
window.onload = main;
