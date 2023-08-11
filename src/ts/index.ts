import * as glm from "gl-matrix";
import { gl, WebGLUtils } from "./gl";

import { Spline } from "../modules/Spline";

import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import { CubicBezierCurve } from "../modules/CubicBezierCurve";
import { DrawableObject } from "./DrawableObject";
import { F } from "./F";
import { Pyramid } from "./Pyramid";
import { Ground } from "./Ground";

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
    new Ground(gl_handler.gl),
  );

  setupEventHandlers();
  start = Date.now();
  animateTiangle();
}

var begin_movement : glm.vec2 = glm.vec2.create();
var moving_camera_with_mouse : boolean = false;

var y_axis_transformed : glm.vec3;
var x_axis_transformed : glm.vec3;

function setupEventHandlers() {
  window.addEventListener('keydown', (event) => {
    switch (event.code) {
      case "ArrowUp": 
        look_at[0] += 0.5;
        break;
      case "ArrowDown": 
        look_at[0] -= 0.5;
        break;
      case "ArrowRight": 
        look_at[2] += 0.5
        break;
      case "ArrowLeft": 
        look_at[2] -= 0.5
        break;
    }
  });

  canva.addEventListener("pointerdown", (event) => {
    console.log(`clicked ${event.clientX}, ${event.clientY}`);
    begin_movement[0] = event.clientX;
    begin_movement[1] = event.clientY;
    moving_camera_with_mouse = true;

    const camera_origin_vec = glm.vec3.create();
    glm.vec3.sub(camera_origin_vec, look_at, camera_position_in_world);
    glm.vec3.normalize(camera_origin_vec, camera_origin_vec);

    const up_normalized = glm.vec3.create();
    glm.vec3.normalize(up_normalized, up_position);

    const cross_up_camera = glm.vec3.create();
    glm.vec3.cross(cross_up_camera, camera_origin_vec, up_normalized);

    const up_new = glm.vec3.create();
    glm.vec3.cross(up_new, cross_up_camera, camera_origin_vec);


    y_axis_transformed = up_new;
    x_axis_transformed = cross_up_camera;

    console.log("x axis: ", x_axis_transformed);
    console.log("y axis: ", y_axis_transformed);


    canva.addEventListener("pointermove", func);
  });

  canva.addEventListener("pointerup", (event) => {
    console.log(`left ${event}`);
    moving_camera_with_mouse = false;
    canva.removeEventListener("pointermove", func);
  });

  canva.addEventListener("wheel", (event) => {
    const origin_camera_vec = glm.vec3.create();
    glm.vec3.sub(origin_camera_vec,camera_position_in_world, look_at);

    const old_size = glm.vec3.len(origin_camera_vec);
    const normalized_vec = glm.vec3.create();
    glm.vec3.normalize(normalized_vec, origin_camera_vec);
    
    if (event.deltaY > 0) {
      glm.vec3.scaleAndAdd(camera_position_in_world, look_at, normalized_vec, old_size + 1.00);
    }
    else if (event.deltaY < 0) {
      glm.vec3.scaleAndAdd(camera_position_in_world, look_at, normalized_vec, old_size - 1.00);
    }
  });

  const func = (event: PointerEvent) => {
    // console.log(`${event.clientX}, ${event.clientY}`);
    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);

    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);

    glm.vec3.rotateY(camera_position_in_world, camera_position_in_world, y_axis_transformed, change[0] * -0.01);
    glm.vec3.rotateX(camera_position_in_world, camera_position_in_world, x_axis_transformed, change[1] * 0.01);

    begin_movement = glm.vec2.clone(current_position);
  }
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

// Camera infos
var camera_position_in_world : glm.vec3 = [15, 7.5, 0];
var up_position : glm.vec3 = [0.0, 1.0, 0.0];
var look_at : glm.vec3 = [0,0,0];

const canva = document.getElementById("mainCanvas") as HTMLCanvasElement;
// Create perspective matrix
const field_of_view = Math.PI / 4.0;
const near = 0.01;
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
  // const model = objects[0].model;
  // glm.mat4.scale(model, model, [1.0/30.0, -1.0/30.0, 1.0/30.0]);
  // glm.mat4.scale(model, model, [10, 0, 10]);
  // glm.mat4.rotateY(model, model, angle);
  // objects[0].model = model;
  // glm.mat4.translate(model, model, [Math.sin(angle/2) * 300, 0.0, 0.0]);

  // Create view matrix
  const radius = 100.0
  // const camera_position_in_world : glm.vec3 = [Math.cos(angle) * radius, 50.0, Math.sin(angle) * radius ];
  
  const location_spline = spline.getPoint(percent_animation);
  const looking_at_tangent = spline.getPointTangent(percent_animation);
  glm.vec3.normalize(looking_at_tangent, looking_at_tangent);
  glm.vec3.add(looking_at_tangent, looking_at_tangent, location_spline);
  
  // const camera_position_in_world : glm.vec3 = [location_spline[0], location_spline[1], location_spline[2]];
  // const up_position : glm.vec3 = [0.0, 1.0, 0.0];
  // const look_at : glm.vec3 = looking_at_tangent;

  // const camera_position_in_world : glm.vec3 = [15, 7.5, 0];
  // const up_position : glm.vec3 = [0.0, 1.0, 0.0];
  // const look_at : glm.vec3 = glm.vec3.transformMat4(glm.vec3.create(), [0,0,0], model); // Look at the F
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