import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { gl as glHelper } from "./gl";

import vertexSource from "../shaders/vertexShader.glsl";
import fragmentSource from "../shaders/fragmentShader.glsl";

export class F implements DrawableObject {
  public model : glm.mat4;

  private static initialized : boolean = false;
  private static program : WebGLProgram;
  private static vao : WebGLVertexArrayObject;
  private static buffer_vertices : WebGLBuffer;
  private static u_model : WebGLUniformLocation;
  private static u_view : WebGLUniformLocation;
  private static u_projection : WebGLUniformLocation;
  private static a_position : number;
  private static vertices : number = 0;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [1.0/30.0, -1.0/30.0, 1.0/30.0]);
    glm.mat4.translate(this.model, this.model, [-100, -150, -130]);
    glm.mat4.rotate(this.model, this.model, Math.PI / 12.0, [0.0, 1.0, 0.0]);
    
    if (!F.initialized) {
      this.setup(gl);
    }
    F.initialized = true;

    // Put data to buffer
    this.setup(gl);
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(F.program as WebGLProgram);

    gl.bindVertexArray(F.vao);
    
    gl.uniformMatrix4fv(F.u_model, false, this.model);
    gl.uniformMatrix4fv(F.u_view, false, view);
    gl.uniformMatrix4fv(F.u_projection, false, projection);

    gl.drawArrays(
      WebGL2RenderingContext.TRIANGLES,
      0, 
      F.vertices
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
    
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    F.program = glHelper.createProgram(
      gl,
      glHelper.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      glHelper.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(F.program);
    
    // Look up uniform and attributes positions
    F.u_model = gl.getUniformLocation(F.program, "model") as WebGLUniformLocation;
    F.u_view = gl.getUniformLocation(F.program, "view") as WebGLUniformLocation;
    F.u_projection = gl.getUniformLocation(F.program, "projection") as WebGLUniformLocation;
    
    F.a_position = gl.getAttribLocation(F.program, "position");
    
    // Create the Vertex Array Object
    F.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(F.vao);
    
    // Create the vertices buffer
    F.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, F.buffer_vertices);

    // Tell it how to read Data
    gl.vertexAttribPointer(
      F.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(F.a_position);

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
    
    const data = [
      // left column front
      0,   0,  0,
      30,   0,  0,
       0, 150,  0,
       0, 150,  0,
      30,   0,  0,
      30, 150,  0,

     // top rung front
      30,   0,  0,
     100,   0,  0,
      30,  30,  0,
      30,  30,  0,
     100,   0,  0,
     100,  30,  0,

     // middle rung front
      30,  60,  0,
      67,  60,  0,
      30,  90,  0,
      30,  90,  0,
      67,  60,  0,
      67,  90,  0,

     // left column back
       0,   0,  30,
      30,   0,  30,
       0, 150,  30,
       0, 150,  30,
      30,   0,  30,
      30, 150,  30,

     // top rung back
      30,   0,  30,
     100,   0,  30,
      30,  30,  30,
      30,  30,  30,
     100,   0,  30,
     100,  30,  30,

     // middle rung back
      30,  60,  30,
      67,  60,  30,
      30,  90,  30,
      30,  90,  30,
      67,  60,  30,
      67,  90,  30,

     // top
       0,   0,   0,
     100,   0,   0,
     100,   0,  30,
       0,   0,   0,
     100,   0,  30,
       0,   0,  30,

     // top rung right
     100,   0,   0,
     100,  30,   0,
     100,  30,  30,
     100,   0,   0,
     100,  30,  30,
     100,   0,  30,

     // under top rung
     30,   30,   0,
     30,   30,  30,
     100,  30,  30,
     30,   30,   0,
     100,  30,  30,
     100,  30,   0,

     // between top rung and middle
     30,   30,   0,
     30,   30,  30,
     30,   60,  30,
     30,   30,   0,
     30,   60,  30,
     30,   60,   0,

     // top of middle rung
     30,   60,   0,
     30,   60,  30,
     67,   60,  30,
     30,   60,   0,
     67,   60,  30,
     67,   60,   0,

     // right of middle rung
     67,   60,   0,
     67,   60,  30,
     67,   90,  30,
     67,   60,   0,
     67,   90,  30,
     67,   90,   0,

     // bottom of middle rung.
     30,   90,   0,
     30,   90,  30,
     67,   90,  30,
     30,   90,   0,
     67,   90,  30,
     67,   90,   0,

     // right of bottom
     30,   90,   0,
     30,   90,  30,
     30,  150,  30,
     30,   90,   0,
     30,  150,  30,
     30,  150,   0,

     // bottom
     0,   150,   0,
     0,   150,  30,
     30,  150,  30,
     0,   150,   0,
     30,  150,  30,
     30,  150,   0,

     // left side
     0,   0,   0,
     0,   0,  30,
     0, 150,  30,
     0,   0,   0,
     0, 150,  30,
     0, 150,   0,
    ];

    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, F.buffer_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER, 
      new Float32Array(data), 
      WebGL2RenderingContext.STATIC_DRAW
    );

    F.vertices = data.length / 3;
  }
}