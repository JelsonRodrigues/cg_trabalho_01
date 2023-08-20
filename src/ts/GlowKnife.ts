import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";
import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/knifeVertexShader.glsl";
import fragmentSource from "../shaders/knifeFragmentShader.glsl";
import { AnimatedObject } from "./AnimatedObject";

export class GlowKnife implements DrawableObject, AnimatedObject {
  public model : glm.mat4;
  public time_total : number = 2_000 * Math.random() + 1_000;
  private paused_animation : boolean = false;
  private accumulated_time : number = 0;

  private static initialized : boolean = false;
  private static program : WebGLProgram;
  private static vao : WebGLVertexArrayObject;
  private static buffer_vertices : WebGLBuffer;
  private static u_model : WebGLUniformLocation;
  private static u_view : WebGLUniformLocation;
  private static u_projection : WebGLUniformLocation;
  private static a_position : number;
  private static a_normal : number;
  private static a_text_coord : number;
  private static vertices : number = 0;
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

  updateAnimation(fElapsedTime:number): void {
    if (!this.paused_animation) {
      this.accumulated_time += fElapsedTime;
      const percent_animation = this.accumulated_time / this.time_total;
      const translation = glm.vec3.fromValues(this.model[12], this.model[13], this.model[14]);
      glm.mat4.rotate(this.model, glm.mat4.create(), 2 * Math.PI * percent_animation, [0,  1, 0]);
      this.model[12] = translation[0];
      this.model[13] = translation[1];
      this.model[14] = translation[2];
    }
  }

  resetAnimation(): void {
    this.accumulated_time = 0;
  }

  toggleAnimation(): void {
    this.paused_animation = !this.paused_animation;
  }

  pauseAnimation(): void {
    this.paused_animation = true;
  }

  resumeAnimation(): void {
    this.paused_animation = false;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(GlowKnife.program as WebGLProgram);

    gl.bindVertexArray(GlowKnife.vao);
    
    gl.uniformMatrix4fv(GlowKnife.u_model, false, this.model);
    gl.uniformMatrix4fv(GlowKnife.u_view, false, view);
    gl.uniformMatrix4fv(GlowKnife.u_projection, false, projection);

    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, GlowKnife.texture);

    gl.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, GlowKnife.vertices);

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    GlowKnife.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
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
  
    WebGLUtils.readObj("./objects/GlowKnife/Glow_Knife.obj").then(
      (obj_result) => {
        const packed_data = new Float32Array(obj_result.index_vertices.length * 8);

        for (let i = 0; i < obj_result.index_vertices.length; ++i) {
          const vertex = obj_result.vertices[obj_result.index_vertices[i]];
          const normal = obj_result.normals[obj_result.index_normals[i]];
          const texture_cordinates = obj_result.texture_cordinates[obj_result.index_texture_cordinates[i]];

          packed_data[i*8 + 0] = vertex[0]; 
          packed_data[i*8 + 1] = vertex[1];  
          packed_data[i*8 + 2] = vertex[2]; 

          packed_data[i*8 + 3] = normal[0];
          packed_data[i*8 + 4] = normal[1];
          packed_data[i*8 + 5] = normal[2];

          packed_data[i*8 + 6] = texture_cordinates[0];
          packed_data[i*8 + 7] = texture_cordinates[1];
        }

        gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, GlowKnife.buffer_vertices);
        gl.bufferData(
          WebGL2RenderingContext.ARRAY_BUFFER,
          packed_data,
          WebGL2RenderingContext.STATIC_DRAW
        );

        GlowKnife.vertices = obj_result.index_vertices.length;
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