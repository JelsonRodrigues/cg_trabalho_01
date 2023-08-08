import * as glm from "gl-matrix";
import { gl, WebGLUtils } from "./gl";

import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";

var gl_handler : gl; 

async function main() {
  // Get canvas
  const canva = document.getElementById("mainCanvas") as HTMLCanvasElement;
  canvasResize(canva);

  const vsSource = vertexShader;
  const fsSource = fragmentShader;
  gl_handler = new gl(canva, vsSource, fsSource);  

  console.log(gl_handler);
  gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

  // Create model matrix
  const model = glm.mat4.create();
  glm.mat4.identity(model);
  glm.mat4.rotateZ(model, model, Math.PI / 36);
  console.log(model);

  // Create view matrix
  const camera_position_in_world : glm.vec3 = [0, 0, 2.0];
  const up_position : glm.vec3 = [0.0, 1.0, 0.0];
  const look_at : glm.vec3 = [0.0, 0.0, 0.0];

  const camera = glm.mat4.create();
  glm.mat4.targetTo(camera, camera_position_in_world, look_at, up_position);
  console.log("targetTo ", camera);

  // Create perspective matrix
  const field_of_view = Math.PI / 4.0;
  const near = 1;
  const far = 1000;
  const aspect_ratio = canva.width / canva.height;
  const perspective = glm.mat4.create();
  glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);
  console.log(perspective);

  gl_handler.gl.viewport(0, 0, canva.width, canva.height);

  gl_handler.drawTriangle(model, camera, perspective);

  start = Date.now();
  animateTiangle();
}

function setupEventHandlers() {

}

function canvasResize(canva:HTMLCanvasElement) {
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


const canva = document.getElementById("mainCanvas") as HTMLCanvasElement;
// Create perspective matrix
const field_of_view = Math.PI / 4.0;
const near = 0.1;
const far = 1000;
const aspect_ratio = canva.width / canva.height;
const perspective = glm.mat4.create();
glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);

// glm.mat4.ortho(perspective, -5, 5, -5, 5, 0.1, 1000);

function animateTiangle() {

  const now = Date.now();
  const percent_animation = (now - start) / full_rotation;
  const angle = Math.PI * 2 * percent_animation;

  // // Create model matrix
  const model = glm.mat4.create();
  glm.mat4.identity(model);
  glm.mat4.scale(model, model, [1.0/30.0, -1.0/30.0, 1.0/30.0]);
  glm.mat4.translate(model, model, [Math.sin(angle/2) * 300, 0.0, 0.0]);

  // Create view matrix
  const radius = 10.0
  // const camera_position_in_world : glm.vec3 = [Math.cos(angle) * radius, 0.0, Math.sin(angle) * radius];
  const camera_position_in_world : glm.vec3 = [15, 0, 15];
  const up_position : glm.vec3 = [0.0, 1.0, 0.0];
  const look_at : glm.vec3 = [0.0, 0.0, 0.0];

  const camera = glm.mat4.create();
  glm.mat4.lookAt(camera, camera_position_in_world, look_at, up_position);

  gl_handler.drawTriangle(model, camera, perspective);
  
  // if (percent_animation <= 1.0) {requestAnimationFrame(animateTiangle);}
  requestAnimationFrame(animateTiangle);
}

window.onload = main