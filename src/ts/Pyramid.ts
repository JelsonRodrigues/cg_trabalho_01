import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/vertexShader.glsl";
import fragmentSource from "../shaders/fragmentShader.glsl";

export class Pyramid implements DrawableObject {
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
  private static faces : number = 0;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [5, 8, 5]);
    glm.mat4.rotate(this.model, this.model, -Math.PI / 2.0, [1.0, 0.0, 0.0]);
    
    if (!Pyramid.initialized){
      this.setup(gl);
    }

    Pyramid.initialized = true;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(Pyramid.program as WebGLProgram);

    gl.bindVertexArray(Pyramid.vao);
    
    gl.uniformMatrix4fv(Pyramid.u_model, false, this.model);
    gl.uniformMatrix4fv(Pyramid.u_view, false, view);
    gl.uniformMatrix4fv(Pyramid.u_projection, false, projection);

    gl.drawElements(
      WebGL2RenderingContext.TRIANGLES,
      Pyramid.faces,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    Pyramid.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(Pyramid.program);
    
    // Look up uniform and attributes positions
    Pyramid.u_model = gl.getUniformLocation(Pyramid.program, "model") as WebGLUniformLocation;
    Pyramid.u_view = gl.getUniformLocation(Pyramid.program, "view") as WebGLUniformLocation;
    Pyramid.u_projection = gl.getUniformLocation(Pyramid.program, "projection") as WebGLUniformLocation;
    
    Pyramid.a_position = gl.getAttribLocation(Pyramid.program, "position");
    
    // Create the vertices buffer
    Pyramid.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    Pyramid.buffer_index_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the Vertex Array Object
    Pyramid.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(Pyramid.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Pyramid.buffer_vertices);
    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Pyramid.buffer_index_vertices);

    // Tell it how to read Data
    gl.vertexAttribPointer(
      Pyramid.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(Pyramid.a_position);

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);

    const data = WebGLUtils.readObj("./objects/pyramid.obj").then(
      ([vertexArray, vertexTextCoordArray, vertexNormalArray, 
        vertexIndexArray, vertexIndexTextCoordArray, vertexIndexNormalArray]) => {
          gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Pyramid.buffer_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ARRAY_BUFFER,
            new Float32Array(vertexArray),
            WebGL2RenderingContext.STATIC_DRAW
          );

          gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Pyramid.buffer_index_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(vertexIndexArray),
            WebGL2RenderingContext.STATIC_DRAW,
          );

          Pyramid.vertices = vertexArray.length / 3;
          Pyramid.faces = vertexIndexArray.length;
        }
    );
  }
}