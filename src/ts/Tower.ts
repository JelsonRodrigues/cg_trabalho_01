import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";
import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/towerVertexShader.glsl";
import fragmentSource from "../shaders/towerFragmentShader.glsl";

export class Tower implements DrawableObject {
  public model : glm.mat4;

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
  private static objects_mtl_ranges : Map<[number, number], WebGLUtils.MTL_Info> = new Map();
  private static texture_albedo : WebGLTexture;
  private static texture_floor_uv1_albedo : WebGLTexture;
  private static texture_grass_albedo : WebGLTexture;
  private static texture_home_uv3_albedo : WebGLTexture;
  private static texture_emissive : WebGLTexture;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.scale(this.model, this.model, [2.0, 2.0, 2.0]);
    glm.mat4.translate(this.model, this.model, [0, 7.1, 0]);
    
    if (!Tower.initialized){
      this.setup(gl);
    }
    Tower.initialized = true;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(Tower.program as WebGLProgram);

    gl.bindVertexArray(Tower.vao);
    
    gl.uniformMatrix4fv(Tower.u_model, false, this.model);
    gl.uniformMatrix4fv(Tower.u_view, false, view);
    gl.uniformMatrix4fv(Tower.u_projection, false, projection);

    Tower.objects_mtl_ranges.forEach(
      (value, key) => {
        switch (value.material) {
          case "home_uv3":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_home_uv3_albedo);
            break;
          case "fences_uv2":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_albedo);
            break;
          case "floor_uv1":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_floor_uv1_albedo);
            break;
          case "grass":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_grass_albedo);
            break;
          case "window":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_emissive);
            break;
        }
        gl.drawArrays(WebGL2RenderingContext.TRIANGLES, key[0], key[1]);
      }
    )

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    Tower.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(Tower.program);
    
    // Look up uniform and attributes positions
    Tower.u_model = gl.getUniformLocation(Tower.program, "model") as WebGLUniformLocation;
    Tower.u_view = gl.getUniformLocation(Tower.program, "view") as WebGLUniformLocation;
    Tower.u_projection = gl.getUniformLocation(Tower.program, "projection") as WebGLUniformLocation;
    
    Tower.a_position = gl.getAttribLocation(Tower.program, "position");
    Tower.a_normal = gl.getAttribLocation(Tower.program, "normal");
    Tower.a_text_coord = gl.getAttribLocation(Tower.program, "text_coord");
    
    // Create the vertices buffer
    Tower.buffer_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the texture buffer
    Tower.texture_albedo = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_albedo);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([128, 0, 0, 255])
    );
    
    Tower.texture_floor_uv1_albedo = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_floor_uv1_albedo);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([0, 128, 128, 255])
    );

    Tower.texture_grass_albedo = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_grass_albedo);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([128, 0, 128, 255])
    );

    Tower.texture_home_uv3_albedo = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_home_uv3_albedo);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([128, 128, 0, 255])
    );

    Tower.texture_emissive = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_emissive);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([128, 255, 0, 255])
    );

    // Create the Vertex Array Object
    Tower.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(Tower.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Tower.buffer_vertices);

    // Tell it how to read Data
    gl.enableVertexAttribArray(Tower.a_position);
    gl.enableVertexAttribArray(Tower.a_normal);
    gl.enableVertexAttribArray(Tower.a_text_coord);

    gl.vertexAttribPointer(
      Tower.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.vertexAttribPointer(
      Tower.a_normal,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );
      
    gl.vertexAttribPointer(
      Tower.a_text_coord,
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
  
    WebGLUtils.readObj("./objects/Tower/obj/lp_tower.obj").then(
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

        gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Tower.buffer_vertices);
        gl.bufferData(
          WebGL2RenderingContext.ARRAY_BUFFER,
          packed_data,
          WebGL2RenderingContext.STATIC_DRAW
        );

        Tower.vertices = obj_result.index_vertices.length;
        Tower.objects_mtl_ranges = obj_result.objects_ranges;
      }
    );

    // Read the textures
    fetch("objects/Tower/textures/albedo.jpeg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_albedo);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/Tower/textures/floor_uv1_albedo.jpeg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_floor_uv1_albedo);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/Tower/textures/grass_albedo.jpeg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_grass_albedo);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/Tower/textures/home_uv3_albedo.jpeg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_home_uv3_albedo);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/Tower/textures/emissive.jpeg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Tower.texture_emissive);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });
  }
}