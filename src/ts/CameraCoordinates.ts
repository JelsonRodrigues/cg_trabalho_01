import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/vertexShader.glsl";
import fragmentSource from "../shaders/fragmentShader.glsl";

export class CameraCoordinates implements DrawableObject {
  public model : glm.mat4;

  private static initialized : boolean = false;
  private static program : WebGLProgram;
  private static vao : WebGLVertexArrayObject;
  private static buffer_vertices : WebGLBuffer;
  private static buffer_index_vertices : WebGLBuffer;
  private static u_model : WebGLUniformLocation;
  private static u_view : WebGLUniformLocation;
  private static u_projection : WebGLUniformLocation;
  private static a_position : number;
  private static vertices : number = 0;
  private static lines : number = 0;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [1, 1, 1]);
    glm.mat4.translate(this.model, this.model, [0, 1, 0]);

    if (CameraCoordinates.initialized == false){
      this.setup(gl);
    }
    CameraCoordinates.initialized = true;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(CameraCoordinates.program as WebGLProgram);

    gl.bindVertexArray(CameraCoordinates.vao);
    
    gl.uniformMatrix4fv(CameraCoordinates.u_model, false, this.model);
    gl.uniformMatrix4fv(CameraCoordinates.u_view, false, view);
    gl.uniformMatrix4fv(CameraCoordinates.u_projection, false, projection);

    gl.drawElements(
      WebGL2RenderingContext.LINES,
      CameraCoordinates.lines,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  }
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    CameraCoordinates.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(CameraCoordinates.program);
    
    // Look up uniform and attributes positions
    CameraCoordinates.u_model = gl.getUniformLocation(CameraCoordinates.program, "model") as WebGLUniformLocation;
    CameraCoordinates.u_view = gl.getUniformLocation(CameraCoordinates.program, "view") as WebGLUniformLocation;
    CameraCoordinates.u_projection = gl.getUniformLocation(CameraCoordinates.program, "projection") as WebGLUniformLocation;
    
    CameraCoordinates.a_position = gl.getAttribLocation(CameraCoordinates.program, "position");
    
    // Create the vertices buffer
    CameraCoordinates.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    CameraCoordinates.buffer_index_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the Vertex Array Object
    CameraCoordinates.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(CameraCoordinates.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, CameraCoordinates.buffer_vertices);
    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, CameraCoordinates.buffer_index_vertices);

    // Tell it how to read Data
    gl.vertexAttribPointer(
      CameraCoordinates.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(CameraCoordinates.a_position);

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);

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

    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, CameraCoordinates.buffer_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER,
      new Float32Array(points),
      WebGL2RenderingContext.STATIC_DRAW
    );

    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, CameraCoordinates.buffer_index_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      WebGL2RenderingContext.STATIC_DRAW,
    );

    CameraCoordinates.vertices = points.length / 3;
    CameraCoordinates.lines = indices.length;
  }

  public UpdatePoints(gl: WebGL2RenderingContext, x : glm.vec3, y : glm.vec3, z : glm.vec3) {
    const points = [
      0, 0, 0,
      x[0], x[1], x[2],
      y[0], y[1], y[2],
      z[0], z[1], z[2],
    ];
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, CameraCoordinates.buffer_vertices);
    gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER,
      new Float32Array(points),
      WebGL2RenderingContext.STATIC_DRAW
    );
  }
}