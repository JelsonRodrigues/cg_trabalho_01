import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { gl as glHelper, WebGLUtils} from "./gl";

import vertexSource from "../shaders/knifeVertexShader.glsl";
import fragmentSource from "../shaders/knifeFragmentShader.glsl";

export class GlowKnife implements DrawableObject {
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
  private static a_normal : number;
  private static a_text_coord : number;
  private static vertices : number = 0;
  private static faces : number = 0;
  private static texture : WebGLTexture;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.translate(this.model, this.model, [-5, 0, 8]);
    glm.mat4.rotateY(this.model, this.model, Math.PI / 4,);
    glm.mat4.rotateZ(this.model, this.model, -Math.PI / 4);
    
    if (!GlowKnife.initialized){
      this.setup(gl);
    }
    GlowKnife.initialized = true;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(GlowKnife.program as WebGLProgram);

    gl.bindVertexArray(GlowKnife.vao);
    
    gl.uniformMatrix4fv(GlowKnife.u_model, false, this.model);
    gl.uniformMatrix4fv(GlowKnife.u_view, false, view);
    gl.uniformMatrix4fv(GlowKnife.u_projection, false, projection);

    gl.drawElements(
      WebGL2RenderingContext.TRIANGLES,
      GlowKnife.faces,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0
    );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    GlowKnife.program = glHelper.createProgram(
      gl,
      glHelper.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      glHelper.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(GlowKnife.program);
    
    // Look up uniform and attributes positions
    GlowKnife.u_model = gl.getUniformLocation(GlowKnife.program, "model") as WebGLUniformLocation;
    GlowKnife.u_view = gl.getUniformLocation(GlowKnife.program, "view") as WebGLUniformLocation;
    GlowKnife.u_projection = gl.getUniformLocation(GlowKnife.program, "projection") as WebGLUniformLocation;
    
    GlowKnife.a_position = gl.getAttribLocation(GlowKnife.program, "position");
    GlowKnife.a_normal = gl.getAttribLocation(GlowKnife.program, "normal");
    GlowKnife.a_text_coord = gl.getAttribLocation(GlowKnife.program, "text_coord");
    
    // Create the vertices buffer
    GlowKnife.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    GlowKnife.buffer_index_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the texture buffer
    GlowKnife.texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, GlowKnife.texture);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([128, 128, 128, 255])
    );

    // Create the Vertex Array Object
    GlowKnife.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(GlowKnife.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, GlowKnife.buffer_vertices);
    gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, GlowKnife.buffer_index_vertices);

    // Tell it how to read Data
    gl.enableVertexAttribArray(GlowKnife.a_position);
    gl.enableVertexAttribArray(GlowKnife.a_normal);
    gl.enableVertexAttribArray(GlowKnife.a_text_coord);

    gl.vertexAttribPointer(
      GlowKnife.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.vertexAttribPointer(
      GlowKnife.a_normal,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );
      
    gl.vertexAttribPointer(
      GlowKnife.a_text_coord,
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
  
    const data = WebGLUtils.readObj("./objects/GlowKnife/Glow_Knife.obj").then(
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

            packed_data[8 * i + 6] = vertexTextCoordArray[2 * i + 0];
            packed_data[8 * i + 7] = vertexTextCoordArray[2 * i + 1];
          }

          gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, GlowKnife.buffer_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ARRAY_BUFFER,
            packed_data,
            WebGL2RenderingContext.STATIC_DRAW
          );

          gl.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, GlowKnife.buffer_index_vertices);
          gl.bufferData(
            WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(vertexIndexArray),
            WebGL2RenderingContext.STATIC_DRAW,
          );

          GlowKnife.vertices = vertexArray.length / 3;
          GlowKnife.faces = vertexIndexArray.length;
        }
    );
    
    // Read the texture
    fetch("objects/GlowKnife/Glow_Knife_Texture.png")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, GlowKnife.texture);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });
  }
}