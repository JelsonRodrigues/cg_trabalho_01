import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { gl as glHelper, WebGLUtils} from "./gl";

import vertexSource from "../shaders/virusVertexShader.glsl";
import fragmentSource from "../shaders/virusFragmentShader.glsl";

export class Virus extends DrawableObject {
  private vao : WebGLVertexArrayObject;
  private buffer_vertices : WebGLBuffer;
  private buffer_index_vertices : WebGLBuffer;
  private u_model : WebGLUniformLocation;
  private u_view : WebGLUniformLocation;
  private u_projection : WebGLUniformLocation;
  private a_position : number;
  private a_normal : number;
  private a_text_coord : number;
  private vertices : number = 0;
  private faces : number = 0;

  constructor (gl : WebGL2RenderingContext) {
    super();
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [1/15.0, 1/15.0, 1/15.0]);
    glm.mat4.translate(this.model, this.model, [53, 75, 0]);
    
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
    this.a_normal = gl.getAttribLocation(this.program, "normal");
    this.a_text_coord = gl.getAttribLocation(this.program, "text_coord");
    
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
      8 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.a_position);

    gl.vertexAttribPointer(
      this.a_normal,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.a_normal);
    gl.vertexAttribPointer(
      this.a_text_coord,
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.a_text_coord);

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
      WebGL2RenderingContext.TRIANGLES,
      this.faces,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  override setup(gl: WebGL2RenderingContext): void {
    const data = WebGLUtils.readObj("./objects/Virus/Coronavirus_Lowpoly.obj").then(
      ([vertexArray, vertexTextCoordArray, vertexNormalArray, 
        vertexIndexArray, vertexIndexTextCoordArray, vertexIndexNormalArray]) => {
          const packed_data = new Float32Array(vertexArray.length * 8);
          
          for (let i = 0; i < vertexArray.length / 3; ++i) {
            packed_data[8 * i + 0] = vertexArray[3 * i + 0];
            packed_data[8 * i + 1] = vertexArray[3 * i + 1];
            packed_data[8 * i + 2] = vertexArray[3 * i + 2];

            packed_data[8 * i + 3] = vertexNormalArray[3 * i + 0];
            packed_data[8 * i + 4] = vertexNormalArray[3 * i + 1];
            packed_data[8 * i + 5] = vertexNormalArray[3 * i + 2];

            packed_data[8 * i + 6] = 0;
            packed_data[8 * i + 7] = 0;
          }

          console.log("Vertex Array ", vertexArray);
          console.log("Vertex TextCoord Array ", vertexTextCoordArray);
          console.log("Vertex Index Array ", vertexIndexArray);

          gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ARRAY_BUFFER,
            packed_data,
            WebGL2RenderingContext.STATIC_DRAW
          );

          gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.buffer_index_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(vertexIndexArray),
            WebGL2RenderingContext.STATIC_DRAW,
          );

          this.vertices = vertexArray.length / 3;
          this.faces = vertexIndexArray.length;
        }
    );
  }
}