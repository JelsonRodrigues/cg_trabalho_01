import * as glm from "gl-matrix";

import { Spline } from "../modules/Spline";
import { CubicBezierCurve } from "../modules/CubicBezierCurve";
import { DrawableObject } from "./DrawableObject";
import { Camera } from "./Camera";
import { F } from "./F";
import { Pyramid } from "./Pyramid";
import { Ground } from "./Ground";
import { Tower } from "./Tower";
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
  const widht = window.innerWidth - 25;
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
    [-9.217018127441406 * 2, 2.861806631088257, -16.13921356201172 * 2],
    [13.516002655029297 * 2, -0.3669872283935547, -19.892250061035156 * 2],
    [15.274385452270508 * 2, 4.701427459716797, -6.95806884765625 * 2],
    [6.714755535125732 * 2, 2.398991346359253, 10.73779296875 * 2]);

  const curve2 = new CubicBezierCurve(
    [6.714755535125732 * 2, 2.398991346359253, 10.73779296875 * 2],
    [1.5150108337402344 * 2, 0.6092761754989624, 21.847110748291016 * 2],
    [4.333532333374023 * 2, 19.296329498291016, 10.84915828704834 * 2],
    [-5.867332458496094 * 2, 11.919515609741211, 10.881692886352539 * 2]);

  const curve3 = new CubicBezierCurve(
    [-5.867332458496094 * 2, 11.919515609741211, 10.881692886352539 * 2],
    [-19.680273056030273 * 2, 1.9306092262268066, 10.925747871398926 * 2],
    [-13.041866302490234 * 2, 6.362720489501953, -0.6656398773193359 * 2],
    [-16.463207244873047 * 2, 12.278007507324219, -7.226930618286133 * 2]);
  
  const curve4 = new CubicBezierCurve(
    [-16.463207244873047 * 2, 12.278007507324219, -7.226930618286133 * 2],
    [-26.186386108398438 * 2, 29.088781356811523, -25.873594284057617 * 2],
    [-15.629554748535156 * 2, 3.681765556335449, -15.161378860473633 * 2],
    [-9.217018127441406 * 2, 2.861806631088257, -16.13921356201172 * 2]);
    
  spline.addCurve(curve);
  spline.addCurve(curve2);
  spline.addCurve(curve3);
  spline.addCurve(curve4);

  spline.turnG1Continuous();

  const spline_camera_look = new Spline();
  spline_camera_look.addCurve(
    new CubicBezierCurve(
      [-0.5161744022503516 * 10, 2, 0.17580872011251758 * 10],
      [-0.6061884669479606 * 10, 2, 0.04360056258790436 * 10],
      [-0.5893108298171589 * 10, 2, -0.18706047819971872 * 10],
      [-0.369901547116737 * 10, 2, -0.3361462728551336 * 10],
    )
  );
  spline_camera_look.addCurve(
    new CubicBezierCurve(
      [-0.369901547116737 * 10, 2, -0.3361462728551336 * 10],
      [-0.12832188223119775 * 10, 2, -0.5002965579696668 * 10],
      [0.06329113924050633 * 10, 2, -0.42616033755274263 * 10],
      [0.21237693389592124 * 10, 2, -0.30239099859353025 * 10],
    )
  );
  spline_camera_look.addCurve(
    new CubicBezierCurve(
      [0.21237693389592124 * 10, 2, -0.30239099859353025 * 10],
      [0.44008182002421914 * 10, 2, -0.11335297992098109 * 10],
      [0.40365682137834036 * 10, 2, 0.2039381153305204 * 10],
      [0.18143459915611815 * 10, 2, 0.3108298171589311 * 10],
    )
  );
  spline_camera_look.addCurve(
    new CubicBezierCurve(
      [0.18143459915611826 * 10, 2, 0.3108298171589311 * 10],
      [-0.21550623976970856 * 10, 2, 0.5017633852498352 * 10],
      [-0.38115330520393814 * 10, 2, 0.34177215189873417 * 10],
      [-0.5161744022503516 * 10, 2, 0.17580872011251758 * 10],
    )
  );
  
  const moving_camera = new MovingCamera([0, 1, 0], spline, spline_camera_look, 15000);
  
  cameras.push(
    new Camera([15, 10, 0], [0, 0, 0], [0, 1, 0]),
    moving_camera
  );

  animated_objects.push(moving_camera);

  let translation = glm.vec3.create();
  for (let i =0; i < 35; ++i){
    const virus = new Virus(gl);

    glm.vec3.add(translation, translation, [ 50, 15, 3 ]);
    glm.mat4.translate(virus.model, virus.model, translation);
    objects.push(virus);
    animated_objects.push(virus);
  }

  objects.push(
    // new F(gl),
    // new Pyramid(gl),
    // new Ground(gl),
    new GlowKnife(gl),
    // new SplinePoints(gl, spline),
    new Tower(gl),
  );

  setupEventHandlers();
  start = Date.now();
  animateTiangle();
}

var begin_movement : glm.vec2 = glm.vec2.create();

var index_curve_in_spline = -1;
var index_control_point_in_curve = -1;
var spline_modifiyng : SplinePoints | null = null;

function setupEventHandlers() {
  window.addEventListener('keydown', (event) => {
    let camera = cameras[current_camera];
    const camera_position = camera.getCameraPosition();
    const camera_to_look_at_vector = glm.vec3.sub(glm.vec3.create(), camera.getCameraLookingAt(), camera_position);
    const camera_matrix = camera.getCameraMatrix();
    let new_look_at : glm.vec3;
    let vec_movement : glm.vec3;
    switch (event.code) {
      case "ArrowUp": // Translate along -z
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[8], camera_matrix[9], camera_matrix[10]), -0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ArrowDown": // Translate along z
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[8], camera_matrix[9], camera_matrix[10]), 0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ArrowRight": // Translate along +x
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]), 0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ArrowLeft": // Translate along -x
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]), -0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ShiftRight": 
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]), 0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ControlRight": 
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]), -0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "KeyV":
        camera = cameras[current_camera];
        if (camera instanceof MovingCamera) { camera.pauseAnimation(); } // Pause animation
        current_camera = (current_camera + 1) % cameras.length;
        camera = cameras[current_camera];
        if (camera instanceof MovingCamera) { camera.resumeAnimation(); } // Resume animation
        break;
      case "KeyJ":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.turnG0Continuous();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "KeyK":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.turnG1Continuous();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "KeyL":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.turnC1Continuous();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      // case "Semicolon":
      //   if (spline_modifiyng != null) {
      //     spline_modifiyng = spline_modifiyng as SplinePoints;
      //     for (let i = 0; i < spline_modifiyng.spline.getNumCurvesInSpline; ++i) {
      //       const curve = spline_modifiyng.spline.getCurveByIndex(i);
      //       curve?.getControlPoints.forEach((point)=>{
      //         console.log(point);
      //       });
      //     }
      //   }
      //   break;
      case "KeyH":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.addCurve(new CubicBezierCurve([10, 10, 10], [15, 10, 10], [20, 10, 10], [25, 10, 10]));
          spline_modifiyng.spline.sampleSpline();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "KeyC":
        camera.updateLookAt(glm.vec3.fromValues(0, 0, 0));
        break;
    }
  });

  canva.addEventListener("pointerdown", (event) => {
    begin_movement[0] = event.clientX;
    begin_movement[1] = event.clientY;
    // console.log((begin_movement[0] *2.0) / canva.width -1.0, (-begin_movement[1] * 2.0) / canva.height + 1.0);
    if (event.button == 0) {
      // Check if the click is in a control point
      const splines = objects.filter((object) => {
        return object instanceof SplinePoints;
      });
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
              spline_modifiyng = spline;
              index_curve_in_spline = c;
              index_control_point_in_curve = j;
              canva.addEventListener("pointermove", modify_spline);
              return;
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
      canva.removeEventListener("pointermove", modify_spline);
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
    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);
    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);
    
    if (spline_modifiyng == null) { return; }
    spline_modifiyng = spline_modifiyng as SplinePoints;
    const spline = spline_modifiyng.spline;
    const curve = spline.getCurveByIndex(index_curve_in_spline) as CubicBezierCurve;
    const point = curve.getControlPointByIndex(index_control_point_in_curve) as glm.vec3;

    const camera_position_in_world = cameras[current_camera].getCameraPosition();
    const camera_to_point_vec = glm.vec3.sub(glm.vec3.create(), point, camera_position_in_world);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);

    const rotation_arround_y = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_y, rotation_arround_y, change[0] * -0.0025, y_axis_transformed);
    glm.vec3.transformMat4(camera_to_point_vec, camera_to_point_vec, rotation_arround_y);

    const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]);
    const rotation_arround_x = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_x, rotation_arround_x, change[1] * -0.0025, x_axis_transformed);
    glm.vec3.transformMat4(camera_to_point_vec, camera_to_point_vec, rotation_arround_x);

    const new_point = glm.vec3.add(glm.vec3.create(), camera_position_in_world, camera_to_point_vec);
    curve.changeControlPoint(index_control_point_in_curve, new_point);
    spline.updateCurve(index_curve_in_spline, curve);
    spline_modifiyng.updateSplinePoints(gl);

    begin_movement = glm.vec2.clone(current_position);
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
      drawable_obj.draw(gl, view_matrix, perspective);
    }
  );
  
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