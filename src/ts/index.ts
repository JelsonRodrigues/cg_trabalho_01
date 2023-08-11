import * as glm from "gl-matrix";
import { gl, WebGLUtils } from "./gl";

import { Spline } from "../modules/Spline";

import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import { CubicBezierCurve } from "../modules/CubicBezierCurve";
import { DrawableObject } from "./DrawableObject";
import { F } from "./F";
import { Pyramid } from "./Pyramid";

var gl_handler : gl; 
var spline : Spline;
var objects : Array<DrawableObject> = new Array();

async function main() {
  // Try read a OBJ
  const obj_data = WebGLUtils.readObj("./objects/pyramid.obj");
  
  spline = new Spline(30);
  const curve = new CubicBezierCurve(
    [-10.0, 0.0, -10.0],
    [-5.0, -5.0, -30.0],
    [5.0, -5.0, -30.0],
    [0.0, 0.0, 10.0]);

  const curve2 = new CubicBezierCurve(
    [0.0, 0.0, 10.0],
    [0.0, 10.0, 5.0],
    [5.0, 15.0, -5.0],
    [1.0, 5.0, -10.0]);

  const curve3 = new CubicBezierCurve(
    [1.0, 5.0, -10.0],
    [-10.0, 6.0, -5.0],
    [-6.0, 7.0, 5.0],
    [5.0, 4.0, -5.0]);
  
  spline.addCurve(curve);
  spline.addCurve(curve2);
  spline.addCurve(curve3);
  spline.sampleSpline();

  // Get canvas
  const canva = document.getElementById("mainCanvas") as HTMLCanvasElement;
  canvasResize(canva);

  const vsSource = vertexShader;
  const fsSource = fragmentShader;
  gl_handler = new gl(canva, vsSource, fsSource);  
  
  const spline_points = new Array();
  spline.array_points.forEach((vec) => {
    spline_points.push(vec[0]);
    spline_points.push(vec[1]);
    spline_points.push(vec[2]);
  });

  gl_handler.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, gl_handler.buffer_control_points);
  gl_handler.gl.bufferData(
    WebGL2RenderingContext.ARRAY_BUFFER, 
    new Float32Array(spline_points), 
    WebGL2RenderingContext.STATIC_DRAW
  );

  gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

  gl_handler.gl.viewport(0, 0, canva.width, canva.height);

  objects.push(
    // new F(gl_handler.gl),
    new Pyramid(gl_handler.gl),
  );

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

function animateTiangle() {

  const now = Date.now();
  const percent_animation = ((now - start) / full_rotation) % 1.0;
  const angle = Math.PI * 2 * percent_animation;

  // // Create model matrix
  const model = glm.mat4.create();
  glm.mat4.identity(model);
  glm.mat4.scale(model, model, [1.0/30.0, -1.0/30.0, 1.0/30.0]);
  objects[0].model = model;
  // glm.mat4.translate(model, model, [Math.sin(angle/2) * 300, 0.0, 0.0]);

  // Create view matrix
  const radius = 10.0
  // const camera_position_in_world : glm.vec3 = [Math.cos(angle) * radius, 0.0, Math.sin(angle) * radius];
  
  const location_spline = spline.getPoint(percent_animation);
  const looking_at_tangent = spline.getPointTangent(percent_animation);
  glm.vec3.normalize(looking_at_tangent, looking_at_tangent);
  glm.vec3.add(looking_at_tangent, looking_at_tangent, location_spline);
  
  const camera_position_in_world : glm.vec3 = [location_spline[0], location_spline[1], location_spline[2]];
  const up_position : glm.vec3 = [0.0, 1.0, 0.0];
  // const look_at : glm.vec3 = looking_at_tangent;

  // const camera_position_in_world : glm.vec3 = [20, 3, 15];
  // const up_position : glm.vec3 = [0.0, 1.0, 0.0];
  const look_at : glm.vec3 = glm.vec3.transformMat4(glm.vec3.create(), [0,0,0], model); // Look at the F
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

window.onload = main