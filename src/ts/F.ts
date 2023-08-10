import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { gl as glHelper } from "./gl";

import vertexSource from "../shaders/vertexShader.glsl";
import fragmentSource from "../shaders/fragmentShader.glsl";

export class F extends DrawableObject {
  private vao : WebGLVertexArrayObject;
  private buffer_vertices : WebGLBuffer;
  private u_model : WebGLUniformLocation;
  private u_view : WebGLUniformLocation;
  private u_projection : WebGLUniformLocation;
  private a_position : number;
  private vertices : number = 0;

  constructor (gl : WebGL2RenderingContext) {
    super();
    this.model = glm.mat4.create();
    
    // Create the program
    this.program = glHelper.createProgram(
      gl,
      glHelper.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      glHelper.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(this.program);
    
    // Look up uniform and attributes positions
    this.u_model = gl.getUniformLocation(this.program, "model") as WebGLUniformLocation;
    this.u_view = gl.getUniformLocation(this.program, "view") as WebGLUniformLocation;
    this.u_projection = gl.getUniformLocation(this.program, "projection") as WebGLUniformLocation;
    
    this.a_position = gl.getAttribLocation(this.program, "position");
    
    // Create the Vertex Array Object
    this.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(this.vao);
    
    // Create the vertices buffer
    this.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);

    // Tell it how to read Data
    gl.vertexAttribPointer(
      this.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.a_position);

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);

    // Put data to buffer
    this.setup(gl);
  }

  override draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(this.program as WebGLProgram);

    gl.bindVertexArray(this.vao);
    
    gl.uniformMatrix4fv(this.u_model, false, this.model);
    gl.uniformMatrix4fv(this.u_view, false, view);
    gl.uniformMatrix4fv(this.u_projection, false, projection);

    gl.drawArrays(
      WebGL2RenderingContext.TRIANGLES,
      0, 
      this.vertices
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
    
  
  override setup(gl: WebGL2RenderingContext): void {
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

    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER, 
      new Float32Array(data), 
      WebGL2RenderingContext.STATIC_DRAW
    );

    this.vertices = data.length / 3;
  }
}