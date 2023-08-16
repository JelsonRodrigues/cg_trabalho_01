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
const Camera_1 = require("./Camera");
const F_1 = require("./F");
const Pyramid_1 = require("./Pyramid");
const Ground_1 = require("./Ground");
const CameraCoordinates_1 = require("./CameraCoordinates");
const Virus_1 = require("./Virus");
const GlowKnife_1 = require("./GlowKnife");
const MovingCamera_1 = require("./MovingCamera");
var gl_handler;
var spline;
var objects = new Array();
var cameras = new Array();
var current_camera = 0;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Try read a OBJ
        const obj_data = gl_1.WebGLUtils.readObj("./objects/pyramid.obj");
        spline = new Spline_1.Spline(30);
        const curve = new CubicBezierCurve_1.CubicBezierCurve([-10.0, 10.0, -10.0], [-5.0, 0.0, -30.0], [5.0, 0.0, -30.0], [0.0, 0.0, 10.0]);
        const curve2 = new CubicBezierCurve_1.CubicBezierCurve([0.0, 0.0, 10.0], [0.0, 10.0, 5.0], [5.0, 15.0, -5.0], [1.0, 5.0, -10.0]);
        const curve3 = new CubicBezierCurve_1.CubicBezierCurve([1.0, 5.0, -10.0], [-10.0, 6.0, -5.0], [-6.0, 7.0, 5.0], [5.0, 4.0, -5.0]);
        spline.addCurve(curve);
        spline.addCurve(curve2);
        spline.addCurve(curve3);
        spline.sampleSpline();
        cameras.push(new Camera_1.Camera([15, 10, 0], [0, 0, 0], [0, 1, 0]), new MovingCamera_1.MovingCamera([0, 1, 0], spline, 15000));
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
        objects.push(new F_1.F(gl_handler.gl), new Pyramid_1.Pyramid(gl_handler.gl), new Ground_1.Ground(gl_handler.gl), new CameraCoordinates_1.CameraCoordinates(gl_handler.gl), new Virus_1.Virus(gl_handler.gl), new GlowKnife_1.GlowKnife(gl_handler.gl));
        setupEventHandlers();
        start = Date.now();
        animateTiangle();
    });
}
var begin_movement = glm.vec2.create();
var moving_camera_with_mouse = false;
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
        glm.vec3.sub(origin_camera_vec, camera_position_in_world, look_at);
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
    const move_camera_with_mouse = (event) => {
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
    };
    // This matrix rotates arround an abitrary axis, I get this from the book 
    // Mathematics for 3D Game Programming and Computer Graphics, Third Edition
    const create_rotation_matrix = (axis, angle) => {
        const cos_angle = Math.cos(angle);
        const sin_angle = Math.sin(angle);
        const rotation = glm.mat3.create();
        rotation[0] = cos_angle + (1 - cos_angle) * (axis[0] * axis[0]);
        rotation[1] = (1 - cos_angle) * axis[0] * axis[1] + sin_angle * axis[2];
        rotation[2] = (1 - cos_angle) * axis[0] * axis[2] - sin_angle * axis[1];
        rotation[3] = (1 - cos_angle) * axis[0] * axis[1] - sin_angle * axis[2];
        rotation[4] = cos_angle + (1 - cos_angle) * (axis[1] * axis[1]);
        rotation[5] = (1 - cos_angle) * axis[1] * axis[2] + sin_angle * axis[0];
        rotation[6] = (1 - cos_angle) * axis[0] * axis[2] + sin_angle * axis[1];
        rotation[7] = (1 - cos_angle) * axis[1] * axis[2] - sin_angle * axis[0];
        rotation[8] = cos_angle + (1 - cos_angle) * (axis[2] * axis[2]);
        return rotation;
    };
}
function updateCameraPosition(t, spline, camera) {
    const location_spline = spline.getPoint(t);
    const looking_at_tangent = spline.getPointTangent(t);
    camera.updateCameraPosition(location_spline);
    camera.updateLookAt(looking_at_tangent);
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
const near = 0.01;
const far = 1000;
const aspect_ratio = canva.width / canva.height;
const perspective = glm.mat4.create();
glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);
var before = 0;
function animateTiangle() {
    const now = Date.now();
    const percent_animation = ((now - start) / full_rotation) % 1.0;
    const angle = Math.PI * 2 * percent_animation;
    const fElapsedTime = now - before;
    // Create model matrix
    const model = glm.mat4.create();
    let camera = cameras[current_camera];
    if (camera instanceof MovingCamera_1.MovingCamera) {
        camera.updateAnimation(fElapsedTime);
    }
    const view_matrix = camera.getViewMatrix();
    gl_handler.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
    objects.forEach((drawable_obj) => {
        if (drawable_obj.draw !== undefined) {
            if (drawable_obj instanceof CameraCoordinates_1.CameraCoordinates) {
                const x = glm.vec3.create();
                const y = glm.vec3.create();
                const z = glm.vec3.create();
                const view_without_translation = glm.mat3.fromValues(view_matrix[0], view_matrix[1], view_matrix[2], view_matrix[4], view_matrix[5], view_matrix[6], view_matrix[8], view_matrix[9], view_matrix[10]);
                glm.vec3.transformMat3(x, [1, 0, 0], view_without_translation);
                glm.vec3.transformMat3(y, [0, 1, 0], view_without_translation);
                glm.vec3.transformMat3(z, [0, 0, 1], view_without_translation);
                drawable_obj.UpdatePoints(gl_handler.gl, [x[0], x[1], x[2]], [y[0], y[1], y[2]], [z[0], z[1], z[2]]);
                drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
            }
            else if (drawable_obj instanceof Virus_1.Virus) {
                const model_copy = glm.mat4.clone(drawable_obj.model);
                const model_copy_original = glm.mat4.clone(drawable_obj.model);
                const rotation = glm.mat4.create();
                glm.mat4.rotateZ(rotation, rotation, angle);
                glm.mat4.multiply(model_copy, model_copy, rotation);
                drawable_obj.model = model_copy;
                drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
                for (let i = 0; i < 3; ++i) {
                    const model = glm.mat4.clone(drawable_obj.model);
                    glm.mat4.translate(model, model, [50, 15, 0]);
                    const rotation = glm.mat4.create();
                    glm.mat4.rotateY(rotation, rotation, angle + Math.PI / (i + 1));
                    glm.mat4.multiply(model, model, rotation);
                    drawable_obj.model = model;
                    drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
                }
                // Undo any modification
                drawable_obj.model = model_copy_original;
                glm.mat4.translate(drawable_obj.model, drawable_obj.model, [Math.cos(angle) * 2, Math.sin(angle), 0]);
            }
            else if (drawable_obj instanceof F_1.F) {
                const model = glm.mat4.clone(drawable_obj.model);
                const rotation = glm.mat4.create();
                glm.mat4.rotateY(rotation, rotation, angle * 2);
                glm.mat4.multiply(drawable_obj.model, drawable_obj.model, rotation);
                drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
                drawable_obj.model = glm.mat4.clone(model);
            }
            else if (drawable_obj instanceof GlowKnife_1.GlowKnife) {
                const model = glm.mat4.clone(drawable_obj.model);
                drawable_obj.model[12] += Math.sin(angle) * 6;
                drawable_obj.model[14] += Math.sin(-angle) * 6;
                drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
                drawable_obj.model = model;
            }
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
                drawable_obj.draw(gl_handler.gl, view_matrix, perspective);
            }
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
    before = now;
}
window.onload = main;
