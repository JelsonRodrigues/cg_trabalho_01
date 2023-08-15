import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { gl as glHelper} from "./gl";

import vertexSource from "../shaders/vertexShader.glsl";
import fragmentSource from "../shaders/fragmentShader.glsl";

export class CameraCoordinates extends DrawableObject {
  private vao : WebGLVertexArrayObject;
  private buffer_vertices : WebGLBuffer;
  private buffer_index_vertices : WebGLBuffer;
  private u_model : WebGLUniformLocation;
  private u_view : WebGLUniformLocation;
  private u_projection : WebGLUniformLocation;
  private a_position : number;
  private vertices : number = 0;
  private lines : number = 0;

  constructor (gl : WebGL2RenderingContext) {
    super();
    this.model = glm.mat4.create();

    glm.mat4.scale(this.model, this.model, [1, 1, 1]);
    glm.mat4.translate(this.model, this.model, [0, 1, 0]);
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
    
    // Create the vertices buffer
    this.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    this.buffer_index_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the Vertex Array Object
    this.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(this.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);
    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.buffer_index_vertices);

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

    gl.drawElements(
      WebGL2RenderingContext.LINES,
      this.lines,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  }
  
  override setup(gl: WebGL2RenderingContext): void {
    const points = [
      0, 0, 0,
      1, 0, 0,
      0, 1, 0, 
      0, 0, 1
    ]
    const indices = [
      0, 1, 
      0, 2, 
      0, 3,
    ];

    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER,
      new Float32Array(points),
      WebGL2RenderingContext.STATIC_DRAW
    );

    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.buffer_index_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      WebGL2RenderingContext.STATIC_DRAW,
    );

    this.vertices = points.length / 3;
    this.lines = indices.length;
  }

  public UpdatePoints(gl: WebGL2RenderingContext, x : glm.vec3, y : glm.vec3, z : glm.vec3) {
    const points = [
      0, 0, 0,
      x[0], x[1], x[2],
      y[0], y[1], y[2],
      z[0], z[1], z[2],
    ];
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER,
      new Float32Array(points),
      WebGL2RenderingContext.STATIC_DRAW
    );
  }
}