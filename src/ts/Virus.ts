import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/virusVertexShader.glsl";
import fragmentSource from "../shaders/virusFragmentShader.glsl";

export class Virus implements DrawableObject {
  public model : glm.mat4;

  private static initialized = false;
  private static program : WebGLProgram;
  private static vao : WebGLVertexArrayObject;
  private static buffer_vertices : WebGLBuffer;
  private static buffer_index_vertices : WebGLBuffer;
  private static u_model : WebGLUniformLocation;
  private static u_view : WebGLUniformLocation;
  private static u_projection : WebGLUniformLocation;
  private static a_position : number;
  private static a_normal : number;
  private static a_text_coord : number;
  private static vertices : number = 0;
  private static faces : number = 0;
  private static texture : WebGLTexture;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [1/15.0, 1/15.0, 1/15.0]);
    glm.mat4.translate(this.model, this.model, [53, 75, 0]);
    
    // This will be done just for the first object of this class
    // All the next will reuse the information about the buffers and how to draw them
    // The only thing that will be particular to any object will be the model matrix, 
    // that tell it how to position the objetct in the wolrd
    if (Virus.initialized == false){
      // Setup this object
      this.setup(gl);
    }
    Virus.initialized = true;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(Virus.program as WebGLProgram);

    gl.bindVertexArray(Virus.vao);
    
    gl.uniformMatrix4fv(Virus.u_model, false, this.model);
    gl.uniformMatrix4fv(Virus.u_view, false, view);
    gl.uniformMatrix4fv(Virus.u_projection, false, projection);

    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Virus.texture);

    gl.drawElements(
      WebGL2RenderingContext.TRIANGLES,
      Virus.faces,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    Virus.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(Virus.program);
    
    // Look up uniform and attributes positions
    Virus.u_model = gl.getUniformLocation(Virus.program, "model") as WebGLUniformLocation;
    Virus.u_view = gl.getUniformLocation(Virus.program, "view") as WebGLUniformLocation;
    Virus.u_projection = gl.getUniformLocation(Virus.program, "projection") as WebGLUniformLocation;
    
    Virus.a_position = gl.getAttribLocation(Virus.program, "position");
    Virus.a_normal = gl.getAttribLocation(Virus.program, "normal");
    Virus.a_text_coord = gl.getAttribLocation(Virus.program, "text_coord");
    
    // Create the vertices buffer
    Virus.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    Virus.buffer_index_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the texture buffer
    Virus.texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Virus.texture);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([255, 32, 64, 255])
    );

    // Create the Vertex Array Object
    Virus.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(Virus.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Virus.buffer_vertices);
    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Virus.buffer_index_vertices);

    // Tell it how to read Data
    gl.vertexAttribPointer(
      Virus.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(Virus.a_position);

    gl.vertexAttribPointer(
      Virus.a_normal,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(Virus.a_normal);
    gl.vertexAttribPointer(
      Virus.a_text_coord,
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(Virus.a_text_coord);

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
    
    const data = WebGLUtils.readObj("./objects/Virus/Coronavirus_Lowpoly.obj").then(
      ([vertexArray, vertexTextCoordArray, vertexNormalArray, 
        vertexIndexArray, vertexIndexTextCoordArray, vertexIndexNormalArray]) => {
          console.log(vertexTextCoordArray);
          const packed_data = new Float32Array(vertexArray.length * 8);
          
          for (let i = 0; i < vertexArray.length / 3; ++i) {
            packed_data[8 * i + 0] = vertexArray[3 * i + 0];
            packed_data[8 * i + 1] = vertexArray[3 * i + 1];
            packed_data[8 * i + 2] = vertexArray[3 * i + 2];

            packed_data[8 * i + 3] = vertexNormalArray[3 * i + 0];
            packed_data[8 * i + 4] = vertexNormalArray[3 * i + 1];
            packed_data[8 * i + 5] = vertexNormalArray[3 * i + 2];

            packed_data[8 * i + 6] = vertexTextCoordArray[2*i + 0];
            packed_data[8 * i + 7] = vertexTextCoordArray[2*i + 1];
          }

          gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Virus.buffer_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ARRAY_BUFFER,
            packed_data,
            WebGL2RenderingContext.STATIC_DRAW
          );

          gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Virus.buffer_index_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(vertexIndexArray),
            WebGL2RenderingContext.STATIC_DRAW,
          );

          Virus.vertices = vertexArray.length / 3;
          Virus.faces = vertexIndexArray.length;
        }
    );

    // Read the texture
    fetch("objects/Virus/coronavirus spec.png")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Virus.texture);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });
  }
}