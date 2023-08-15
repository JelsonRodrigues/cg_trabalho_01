import * as glm from "gl-matrix";
import { gl, WebGLUtils } from "./gl";

import { Spline } from "../modules/Spline";

import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import { CubicBezierCurve } from "../modules/CubicBezierCurve";
import { DrawableObject } from "./DrawableObject";
import { Camera } from "./Camera";
import { F } from "./F";
import { Pyramid } from "./Pyramid";
import { Ground } from "./Ground";
import { CameraCoordinates } from "./CameraCoordinates";

var gl_handler : gl; 
var spline : Spline;
var objects : Array<DrawableObject> = new Array();
var cameras : Array<Camera> = new Array();
var current_camera : number = 0;

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

  cameras.push(
    new Camera([15, 10, 0], [0, 0, 0], [0, 1, 0]),
    new Camera([15, 10, 0], [0, 0, 0], [0, 1, 0])
    );

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
    // new Pyramid(gl_handler.gl),
    new Ground(gl_handler.gl),
    new CameraCoordinates(gl_handler.gl),
  );

  setupEventHandlers();
  start = Date.now();
  animateTiangle();
}

var begin_movement : glm.vec2 = glm.vec2.create();
var moving_camera_with_mouse : boolean = false;

function setupEventHandlers() {
  window.addEventListener('keydown', (event) => {
    const camera = cameras[current_camera];
    const look_at = camera.getCameraLookingAt();
    switch (event.code) {
      case "ArrowUp": 
        look_at[0] += 0.5;
        camera.updateLookAt(look_at);
        break;
      case "ArrowDown": 
        look_at[0] -= 0.5;
        camera.updateLookAt(look_at);
        break;
      case "ArrowRight": 
        look_at[2] += 0.5;
        camera.updateLookAt(look_at);
        break;
      case "ArrowLeft": 
        look_at[2] -= 0.5;
        camera.updateLookAt(look_at);
        break;
      case "KeyV":
        console.log("Changed Camera");
        current_camera = (current_camera + 1) % cameras.length;
        break;
    }
  });

  canva.addEventListener("pointerdown", (event) => {
    begin_movement[0] = event.clientX;
    begin_movement[1] = event.clientY;
    moving_camera_with_mouse = true;

    canva.addEventListener("pointermove", move_camera_with_mouse);
  });

  canva.addEventListener("pointerup", (event) => {
    moving_camera_with_mouse = false;
    canva.removeEventListener("pointermove", move_camera_with_mouse);
  });

  canva.addEventListener("wheel", (event) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at = camera.getCameraLookingAt();
    
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

    camera.updateCameraPosition(camera_position_in_world);
  });

  const move_camera_with_mouse = (event: PointerEvent) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at = camera.getCameraLookingAt();
    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);

    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);
    const rotation_arround_y = create_rotation_matrix(y_axis_transformed, change[0] * -0.01);
    glm.vec3.transformMat3(camera_position_in_world, camera_position_in_world, rotation_arround_y);
    
    const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]);
    const rotation_arround_x = create_rotation_matrix(x_axis_transformed, change[1] * -0.01);
    glm.vec3.transformMat3(camera_position_in_world, camera_position_in_world, rotation_arround_x);

    begin_movement = glm.vec2.clone(current_position);
    camera.updateCameraPosition(camera_position_in_world);
  }

  // This matrix rotates arround an abitrary axis, I get this from the book 
  // Mathematics for 3D Game Programming and Computer Graphics, Third Edition
  const create_rotation_matrix = (axis : glm.vec3, angle : number) : glm.mat3 => {
    const cos_angle = Math.cos(angle);
    const sin_angle = Math.sin(angle);
    const rotation = glm.mat3.create();

    rotation[0] = cos_angle + (1-cos_angle) * (axis[0] * axis[0]);
    rotation[1] = (1-cos_angle) * axis[0] * axis[1] + sin_angle * axis[2];
    rotation[2] = (1-cos_angle) * axis[0] * axis[2] - sin_angle * axis[1];

    rotation[3] = (1-cos_angle) * axis[0] * axis[1] - sin_angle * axis[2];
    rotation[4] = cos_angle + (1-cos_angle) * (axis[1] * axis[1]);
    rotation[5] = (1-cos_angle) * axis[1] * axis[2] + sin_angle * axis[0];

    rotation[6] = (1-cos_angle) * axis[0] * axis[2] + sin_angle * axis[1];
    rotation[7] = (1-cos_angle) * axis[1] * axis[2] - sin_angle * axis[0];
    rotation[8] = cos_angle + (1-cos_angle) * (axis[2] * axis[2]);

    return rotation;
  }
}

function updateCameraPosition(t:number, spline:Spline, camera:Camera) {
  const location_spline = spline.getPoint(t);
  const looking_at_tangent = spline.getPointTangent(t);
  glm.vec3.normalize(looking_at_tangent, looking_at_tangent);
  glm.vec3.add(looking_at_tangent, looking_at_tangent, location_spline);
  
  camera.updateCameraPosition(location_spline);
  camera.updateLookAt(looking_at_tangent);
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
const near = 0.01;
const far = 1000;
const aspect_ratio = canva.width / canva.height;
const perspective = glm.mat4.create();
glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);

function animateTiangle() {

  const now = Date.now();
  const percent_animation = ((now - start) / full_rotation) % 1.0;
  const angle = Math.PI * 2 * percent_animation;

  // Create model matrix
  const model = glm.mat4.create();
  
  let camera = cameras[current_camera];
  if (current_camera == 1) {
    updateCameraPosition(percent_animation, spline, camera);
  }
  const view_matrix = camera.getViewMatrix();

  gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
  objects.forEach((drawable_obj) => {
    if (drawable_obj.draw !== undefined) {
      if (drawable_obj instanceof CameraCoordinates) {
        const x = glm.vec4.create();
        const y = glm.vec4.create();
        const z = glm.vec4.create();

        glm.vec4.transformMat4(x, [1, 0, 0, 0], view_matrix);
        glm.vec4.transformMat4(y, [0, 1, 0, 0], view_matrix);
        glm.vec4.transformMat4(z, [0, 0, 1, 0], view_matrix);

        drawable_obj.UpdatePoints(gl_handler.gl, 
          [x[0], x[1], x[2]],
          [y[0], y[1], y[2]],
          [z[0], z[1], z[2]],
          );
      }
      drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
    }
    else {
      console.log("DRAW E UNDEFINED");
      return;
    }
  });
  
  /* Draw the Control points */
  glm.mat4.identity(model);
  gl_handler.drawControlPoints(spline.array_points.length, model, view_matrix, perspective);

  requestAnimationFrame(animateTiangle);
}

window.onload = main