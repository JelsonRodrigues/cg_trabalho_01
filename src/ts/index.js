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
const vertexShader_glsl_1 = __importDefault(require("../shaders/vertexShader.glsl"));
const fragmentShader_glsl_1 = __importDefault(require("../shaders/fragmentShader.glsl"));
var gl_handler;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get canvas
        const canva = document.getElementById("mainCanvas");
        canvasResize(canva);
        const vsSource = vertexShader_glsl_1.default;
        const fsSource = fragmentShader_glsl_1.default;
        gl_handler = new gl_1.gl(canva, vsSource, fsSource);
        console.log(gl_handler);
        gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
        // Create model matrix
        const model = glm.mat4.create();
        glm.mat4.identity(model);
        glm.mat4.rotateZ(model, model, Math.PI / 36);
        console.log(model);
        // Create view matrix
        const camera_position_in_world = [0.0, 0.0, 2.0];
        const up_position = [0.0, 1.0, 0.0];
        const look_at = [0.0, 0.0, 0.0];
        const camera = glm.mat4.create();
        glm.mat4.targetTo(camera, camera_position_in_world, look_at, up_position);
        console.log("targetTo ", camera);
        // Create perspective matrix
        const field_of_view = Math.PI / 4.0;
        const near = 0.01;
        const far = 1000;
        const aspect_ratio = canva.width / canva.height;
        const perspective = glm.mat4.create();
        glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);
        console.log(perspective);
        // glm.mat4.identity(camera);
        // glm.mat4.identity(perspective);
        gl_handler.drawTriangle(model, camera, perspective);
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
const canva = document.getElementById("mainCanvas");
// Create perspective matrix
const field_of_view = Math.PI / 4.0;
const near = 0.01;
const far = 1000;
const aspect_ratio = canva.width / canva.height;
const perspective = glm.mat4.create();
glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);
function animateTiangle() {
    const now = Date.now();
    const percent_animation = (now - start) / full_rotation;
    const angle = Math.PI * 2 * percent_animation;
    // // Create model matrix
    const model = glm.mat4.create();
    glm.mat4.identity(model);
    // glm.mat4.rotateZ(model, model, angle);
    // Create view matrix
    const camera_position_in_world = [Math.cos(angle), 0.0, Math.sin(angle)];
    const up_position = [0.0, 1.0, 0.0];
    const look_at = [0.0, 0.5, 0.0];
    const camera = glm.mat4.create();
    glm.mat4.targetTo(camera, camera_position_in_world, look_at, up_position);
    gl_handler.drawTriangle(model, camera, perspective);
    // if (percent_animation <= 1.0) {requestAnimationFrame(animateTiangle);}
    requestAnimationFrame(animateTiangle);
}
window.onload = main;