import * as glm from "gl-matrix";

import { Spline } from "../modules/Spline";
import { CubicBezierCurve } from "../modules/CubicBezierCurve";
import { DrawableObject } from "./DrawableObject";
import { Camera } from "./Camera";
import { F } from "./F";
import { Pyramid } from "./Pyramid";
import { Ground } from "./Ground";
import { CameraCoordinates } from "./CameraCoordinates";
import { Virus } from "./Virus";
import { GlowKnife } from "./GlowKnife";
import { MovingCamera } from "./MovingCamera";
import { SplinePoints } from "./SplinePoints";
import { AnimatedObject } from "./AnimatedObject";

var canva : HTMLCanvasElement;
var gl : WebGL2RenderingContext;

var spline : Spline;
var objects : Array<DrawableObject> = new Array();
var animated_objects : Array<AnimatedObject> = new Array();
var cameras : Array<Camera> = new Array();
var current_camera : number = 0;

// Animation
var full_rotation = 10000;
var start = Date.now();

var perspective = glm.mat4.create();

function canvasResize(canva:HTMLCanvasElement) {
  const widht = window.innerWidth;
  const height = window.innerHeight - 50;
  canva.width = widht;
  canva.height = height;
  canva.style.width = `${widht}px`;
  canva.style.height = `${height}px`;
}

async function main() {
  // Get canvas
  canva = document.getElementById("mainCanvas") as HTMLCanvasElement;
  canvasResize(canva);
  
  // Setup gl
  gl = canva.getContext("webgl2") as WebGL2RenderingContext;
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT)
  gl.viewport(0, 0, canva.width, canva.height)

  // Create the perspective matrix
  const field_of_view = Math.PI / 4.0;
  const near = 0.01;
  const far = 1000;
  const aspect_ratio = canva.width / canva.height;
  glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);

  spline = new Spline(30);
  const curve = new CubicBezierCurve(
    [-10.0, 10.0, -10.0],
    [-5.0, 0.0, -30.0],
    [5.0, 0.0, -30.0],
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

  spline.turnG1Continuous();

  const moving_camera = new MovingCamera([0, 1, 0], spline, 15000);
  
  cameras.push(
    new Camera([15, 10, 0], [0, 0, 0], [0, 1, 0]),
    moving_camera
  );

  animated_objects.push(moving_camera);

  let translation = glm.vec3.create();
  for (let i =0; i < 25; ++i){
    const virus = new Virus(gl);

    glm.vec3.add(translation, translation, [ 50, 15, 3 ]);
    glm.mat4.translate(virus.model, virus.model, translation);
    objects.push(virus);
    animated_objects.push(virus);
  }

  objects.push(
    new F(gl),
    new Pyramid(gl),
    new Ground(gl),
    new CameraCoordinates(gl),
    new GlowKnife(gl),
    new SplinePoints(gl, spline),
  );

  setupEventHandlers();
  start = Date.now();
  animateTiangle();
}

var begin_movement : glm.vec2 = glm.vec2.create();

function setupEventHandlers() {
  window.addEventListener('keydown', (event) => {
    let camera = cameras[current_camera];
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
        camera = cameras[current_camera];
        if (camera instanceof MovingCamera) { camera.pauseAnimation(); } // Pause animation
        current_camera = (current_camera + 1) % cameras.length;
        camera = cameras[current_camera];
        if (camera instanceof MovingCamera) { camera.resumeAnimation(); } // Resume animation
        break;
    }
  });

  canva.addEventListener("pointerdown", (event) => {
    begin_movement[0] = event.clientX;
    begin_movement[1] = event.clientY;
    console.log((begin_movement[0] *2.0) / canva.width -1.0, (-begin_movement[1] * 2.0) / canva.height + 1.0);
    if (event.button == 0) {
      // Check if the click is in a control point
      const splines = objects.filter((object) => {
        return object instanceof SplinePoints;
      });
      console.log(splines);
      for (let i=0; i< splines.length; ++i) {
        let spline = splines[i] as SplinePoints;
        for (let c = 0; c < spline.spline.getNumCurvesInSpline; ++c) {
          const curve = spline.spline.getCurveByIndex(c) as CubicBezierCurve;
          const num_control_points = (curve.getControlPoints as glm.vec3[]).length;
          for (let j = 0; j < num_control_points; ++j) {
            const point = curve.getControlPointByIndex(j) as glm.vec3;

            // Apply transformations and see if it would be in the same location
            const transformed_point = glm.vec3.create();
            glm.vec3.transformMat4(transformed_point, point, cameras[current_camera].getViewMatrix());
            glm.vec3.transformMat4(transformed_point, transformed_point, perspective);
            
            
            const dist_vec = glm.vec2.sub(
              glm.vec2.create(), 
              glm.vec2.fromValues((begin_movement[0] *2.0) / canva.width -1.0, (-begin_movement[1] * 2.0) / canva.height + 1.0), 
              glm.vec2.fromValues(transformed_point[0], transformed_point[1]) 
              );
            
            // Radius 
            // The further away the point is, the less space it will ocuppy in screen, so I 
            // Must decrease the radius acordingly to the z percentage of the point in relation
            // With the view frustum
            const dist = glm.vec2.length(dist_vec);
            const RADIUS = 0.06;
            if (dist <= RADIUS) {
              canva.addEventListener("pointermove", modify_spline);
            }

          }
        }
      }

      // Otherwise 
      canva.addEventListener("pointermove", orbit_camera_with_mouse);
    }
    else if (event.button == 2) {
      canva.addEventListener("pointermove", move_camera_with_mouse);
    }
  });

  canva.addEventListener("pointerup", (event) => {
    if (event.button == 0) {
      canva.removeEventListener("pointermove", orbit_camera_with_mouse);
    }
    else if (event.button == 2) {
      canva.removeEventListener("pointermove", move_camera_with_mouse);
    }
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

  const modify_spline = (event: PointerEvent) => {
    // TODO CODE
  }

  const orbit_camera_with_mouse = (event: PointerEvent) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at_point = camera.getCameraLookingAt();
    const look_at_to_camera_position_vec = glm.vec3.create();
    glm.vec3.sub(look_at_to_camera_position_vec, camera_position_in_world, look_at_point);

    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);
    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);

    const rotation_arround_y = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_y, rotation_arround_y, change[0] * -0.01, y_axis_transformed);
    glm.vec3.transformMat4(look_at_to_camera_position_vec, look_at_to_camera_position_vec, rotation_arround_y);

    const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]);
    const rotation_arround_x = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_x, rotation_arround_x, change[1] * -0.01, x_axis_transformed);
    glm.vec3.transformMat4(look_at_to_camera_position_vec, look_at_to_camera_position_vec, rotation_arround_x);

    begin_movement = glm.vec2.clone(current_position);
    glm.vec3.add(camera_position_in_world, look_at_point, look_at_to_camera_position_vec);
    camera.updateCameraPosition(camera_position_in_world);
  }

  const move_camera_with_mouse = (event: PointerEvent) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at_point = camera.getCameraLookingAt();
    const camera_position_to_look_at_vec = glm.vec3.create();
    glm.vec3.sub(camera_position_to_look_at_vec, look_at_point, camera_position_in_world);

    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);
    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);

    const rotation_arround_y = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_y, rotation_arround_y, change[0] * -0.005, y_axis_transformed);
    glm.vec3.transformMat4(camera_position_to_look_at_vec, camera_position_to_look_at_vec, rotation_arround_y);

    const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]);
    const rotation_arround_x = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_x, rotation_arround_x, change[1] * -0.005, x_axis_transformed);
    glm.vec3.transformMat4(camera_position_to_look_at_vec, camera_position_to_look_at_vec, rotation_arround_x);

    begin_movement = glm.vec2.clone(current_position);
    glm.vec3.add(look_at_point, camera_position_in_world, camera_position_to_look_at_vec);
    camera.updateLookAt(look_at_point);
  }
}


function animateTiangle() {

  updateAnimation();
  // Create model matrix
  const model = glm.mat4.create();
  
  let camera = cameras[current_camera];
  
  const view_matrix = camera.getViewMatrix();

  gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
  objects.forEach((drawable_obj) => {
    if (drawable_obj instanceof CameraCoordinates) {
      const x = glm.vec3.create();
      const y = glm.vec3.create();
      const z = glm.vec3.create();

      const view_without_translation = glm.mat3.fromValues(
        view_matrix[0], view_matrix[1], view_matrix[2],
        view_matrix[4], view_matrix[5], view_matrix[6],
        view_matrix[8], view_matrix[9], view_matrix[10],
      );

      glm.vec3.transformMat3(x, [1, 0, 0], view_without_translation);
      glm.vec3.transformMat3(y, [0, 1, 0], view_without_translation);
      glm.vec3.transformMat3(z, [0, 0, 1], view_without_translation);

      drawable_obj.UpdatePoints(gl, 
        [x[0], x[1], x[2]],
        [y[0], y[1], y[2]],
        [z[0], z[1], z[2]],
        );
        drawable_obj.draw(gl, view_matrix, perspective);
    }
    else if (drawable_obj instanceof Virus) {
      drawable_obj.draw(gl, view_matrix, perspective);
      // const model_copy = glm.mat4.clone(drawable_obj.model);
      // const model_copy_original = glm.mat4.clone(drawable_obj.model);

      // const rotation = glm.mat4.create();
      // glm.mat4.rotateZ(rotation, rotation, angle)
      // glm.mat4.multiply(model_copy, model_copy, rotation);
      // drawable_obj.model = model_copy;
      // drawable_obj.draw(gl, view_matrix, perspective);

      // for (let i = 0; i < 3; ++i) {
      //   const model = glm.mat4.clone(drawable_obj.model);
      //   glm.mat4.translate(model, model, [50, 15, 0]);
      //   const rotation = glm.mat4.create();
      //   glm.mat4.rotateY(rotation, rotation, angle + Math.PI / (i+1));
      //   glm.mat4.multiply(model, model, rotation);

      //   drawable_obj.model = model;
      //   drawable_obj.draw(gl, view_matrix, perspective);
      // }
      
      // // Undo any modification
      // drawable_obj.model = model_copy_original;
      // glm.mat4.translate(drawable_obj.model, drawable_obj.model, [Math.cos(angle), Math.sin(angle)/4.0, 0]);
    }
    // else if (drawable_obj instanceof F){
    //   const model = glm.mat4.clone(drawable_obj.model);
    //   const rotation = glm.mat4.create();
    //   glm.mat4.rotateY(rotation, rotation, angle * 2);
    //   glm.mat4.multiply(drawable_obj.model, drawable_obj.model, rotation);
    //   drawable_obj.draw(gl, view_matrix, perspective);
    //   drawable_obj.model = glm.mat4.clone(model);
    // }
    // else if (drawable_obj instanceof GlowKnife) {
    //   const model = glm.mat4.clone(drawable_obj.model);

    //   drawable_obj.model[12] += Math.sin(angle) * 6;
    //   drawable_obj.model[14] += Math.sin(-angle) * 6;
    //   drawable_obj.draw(gl, view_matrix, perspective);

    //   drawable_obj.model = model;
    // }
    // else if (drawable_obj instanceof Pyramid) {
    //   // Make so that the pyramid is always facing the camera
    //   const model = glm.mat4.clone(drawable_obj.model);
    //   const camera_matrix = camera.getCameraMatrix();
    //   const lookAt = new Camera(
    //     glm.vec3.fromValues(drawable_obj.model[12], drawable_obj.model[13], drawable_obj.model[14]),
    //     glm.vec3.fromValues(camera_matrix[12], camera_matrix[13], camera_matrix[14]),
    //     glm.vec3.fromValues(0, 1, 0),
    //     );
    //   const make_look = lookAt.getCameraMatrix();

    //   glm.mat4.multiply(drawable_obj.model, make_look, drawable_obj.model);
    //   drawable_obj.draw(gl_handler.gl, view_matrix, perspective);

    //   drawable_obj.model = glm.mat4.clone(model);
    // }
    else {
      drawable_obj.draw(gl, view_matrix, perspective);
    }
  });
  
  requestAnimationFrame(animateTiangle);
}

var before:number = 0;
function updateAnimation() {
  const now = Date.now();
  const fElapsedTime = now - before;
  animated_objects.forEach(
    (object) => {
      object.updateAnimation(fElapsedTime);
    }
  );
  before = now;
}
window.onload = main