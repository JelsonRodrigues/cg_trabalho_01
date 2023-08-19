import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";

import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/virusVertexShader.glsl";
import fragmentSource from "../shaders/virusFragmentShader.glsl";
import { AnimatedObject } from "./AnimatedObject";

export class Virus implements DrawableObject, AnimatedObject {
  public model : glm.mat4;
  public time_total : number = 10_000 * Math.random() + 5_000;
  private roation_axis : glm.vec3 = glm.vec3.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
  private accumulated_time : number = 0;
  private paused_animation : boolean = false;
  private z_radius : number = Math.random() * 10;
  private x_radius : number = Math.random() * 10;
  private y_radius : number = Math.random() * 10;
  private rotation_orientation : number = Math.ceil(Math.random() * 2) % 2 == 0 ? 1.0 : -1.0 ;
  private roation_center : glm.vec3;

  private static initialized = false;
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

  constructor (gl : WebGL2RenderingContext, roation_center:glm.vec3 = glm.vec3.create()) {
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [1/25.0, 1/25.0, 1/25.0]);
    this.roation_center = roation_center;

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

  updateAnimation(fElapsedTime:number): void {
    if (!this.paused_animation) {
      if (this.accumulated_time + fElapsedTime >= this.time_total) {
        // this.x_radius += (Math.random() *2.0 - 1.0);
      }
      this.accumulated_time = (this.accumulated_time + fElapsedTime) % this.time_total;
      const percent_animation = this.accumulated_time / this.time_total;
      
      glm.mat4.rotate(this.model, this.model, 0.001 * fElapsedTime, this.roation_axis);

      this.model[12] = this.roation_center[0] + Math.cos(2 * Math.PI * percent_animation * this.rotation_orientation) * this.x_radius ;
      this.model[13] = this.roation_center[1] +this.y_radius;
      this.model[14] = this.roation_center[2] + Math.sin(2 * Math.PI * percent_animation * this.rotation_orientation) * this.z_radius ;
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
    gl.useProgram(Virus.program as WebGLProgram);

    gl.bindVertexArray(Virus.vao);
    
    gl.uniformMatrix4fv(Virus.u_model, false, this.model);
    gl.uniformMatrix4fv(Virus.u_view, false, view);
    gl.uniformMatrix4fv(Virus.u_projection, false, projection);

    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Virus.texture);

    gl.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, Virus.vertices);

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
    
    WebGLUtils.readObj("./objects/Virus/Coronavirus_Lowpoly.obj").then(
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

        gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Virus.buffer_vertices);
        gl.bufferData(
          WebGL2RenderingContext.ARRAY_BUFFER,
          packed_data,
          WebGL2RenderingContext.STATIC_DRAW
        );

        Virus.vertices = obj_result.index_vertices.length;
      }
      
      // ([vertexArray, vertexTextCoordArray, vertexNormalArray, 
      //   vertexIndexArray, vertexIndexTextCoordArray, vertexIndexNormalArray]) => {
      //     const packed_data = new Float32Array(vertexIndexArray.length * 8);

      //     for (let i = 0; i < vertexIndexArray.length; ++i) {
      //       packed_data[i*8 + 0] = vertexArray[vertexIndexArray[i] * 3 + 0]; 
      //       packed_data[i*8 + 1] = vertexArray[vertexIndexArray[i] * 3 + 1];  
      //       packed_data[i*8 + 2] = vertexArray[vertexIndexArray[i] * 3 + 2]; 

      //       packed_data[i*8 + 3] = vertexNormalArray[vertexIndexNormalArray[i] * 3 + 0];
      //       packed_data[i*8 + 4] = vertexNormalArray[vertexIndexNormalArray[i] * 3 + 1];
      //       packed_data[i*8 + 5] = vertexNormalArray[vertexIndexNormalArray[i] * 3 + 2];

      //       packed_data[i*8 + 6] = vertexTextCoordArray[vertexIndexTextCoordArray[i] * 2 + 0];
      //       packed_data[i*8 + 7] = vertexTextCoordArray[vertexIndexTextCoordArray[i] * 2 + 1];
      //     }

      //     gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Virus.buffer_vertices);
      //     gl.bufferData(
      //       WebGL2RenderingContext.ARRAY_BUFFER,
      //       packed_data,
      //       WebGL2RenderingContext.STATIC_DRAW
      //     );

      //     Virus.vertices = vertexIndexArray.length;
      //   }
    );

    // Read the texture
    fetch("objects/Virus/coronavirus diffuse.png")
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