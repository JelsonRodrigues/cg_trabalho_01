import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";
import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/cabinVertexShader.glsl";
import fragmentSource from "../shaders/cabinFragmentShader.glsl";

export class Cabin implements DrawableObject {
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
  private static texture_bark_willow : WebGLTexture;
  private static texture_reed_roof : WebGLTexture;
  private static texture_rough_wood : WebGLTexture;

  constructor (gl : WebGL2RenderingContext) {
    this.model = glm.mat4.create();
    glm.mat4.rotate(this.model, this.model, -Math.PI / 5, [0, 1, 0]);
    glm.mat4.translate(this.model, this.model, [16, 0, -51]);
    glm.mat4.scale(this.model, this.model, [1.25, 1.25, 1.25]);

    if (!Cabin.initialized){
      this.setup(gl);
    }
    Cabin.initialized = true;
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(Cabin.program as WebGLProgram);

    gl.bindVertexArray(Cabin.vao);
    
    gl.uniformMatrix4fv(Cabin.u_model, false, this.model);
    gl.uniformMatrix4fv(Cabin.u_view, false, view);
    gl.uniformMatrix4fv(Cabin.u_projection, false, projection);

    Cabin.objects_mtl_ranges.forEach(
      (value, key) => {
        switch (value.material) {
          case "Material.001":
          case "Material.002":
          case "Material.003":
          case "Material.004":
          case "Material.005":
          case "Material.006":
          case "Material.007":
          case "Material.008":
          case "Material.009":
          case "Material.010":
          case "Material.011":
          case "Material.012":
          case "Material.013":
          case "Material.015":
          case "Material.017":
          case "Material.018":
          case "Material.019":
          case "Material.024":
          case "Material.027":
          case "Material.029":
          case "Material.030":
          case "Material.032":
          case "Material.033":
          case "Material.034":
          case "Material.035":
          case "Material.036":
          case "Material.037":
          case "Material.038":
          case "Material.039":
          case "Material.040":
          case "Material.041":
          case "Material.042":
          case "Material.043":
          case "Material.046":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_rough_wood);
            break;
          case "Material.016":
          case "Material.020":
          case "Material.021":
          case "Material.022":
          case "Material.023":
          case "Material.025":
          case "Material.026":
          case "Material.031":
          case "Material.044":
          case "Material.045":
          case "Material.047":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_bark_willow);
            break;
          case "Material.028":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_reed_roof);
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
    Cabin.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(Cabin.program);
    
    // Look up uniform and attributes positions
    Cabin.u_model = gl.getUniformLocation(Cabin.program, "model") as WebGLUniformLocation;
    Cabin.u_view = gl.getUniformLocation(Cabin.program, "view") as WebGLUniformLocation;
    Cabin.u_projection = gl.getUniformLocation(Cabin.program, "projection") as WebGLUniformLocation;
    
    Cabin.a_position = gl.getAttribLocation(Cabin.program, "position");
    Cabin.a_normal = gl.getAttribLocation(Cabin.program, "normal");
    Cabin.a_text_coord = gl.getAttribLocation(Cabin.program, "text_coord");
    
    // Create the vertices buffer
    Cabin.buffer_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the texture buffer
    Cabin.texture_bark_willow = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_bark_willow);
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
    
    Cabin.texture_reed_roof = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_reed_roof);
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

    Cabin.texture_rough_wood = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_rough_wood);
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

    // Create the Vertex Array Object
    Cabin.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(Cabin.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Cabin.buffer_vertices);

    // Tell it how to read Data
    gl.enableVertexAttribArray(Cabin.a_position);
    gl.enableVertexAttribArray(Cabin.a_normal);
    gl.enableVertexAttribArray(Cabin.a_text_coord);

    gl.vertexAttribPointer(
      Cabin.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.vertexAttribPointer(
      Cabin.a_normal,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );
      
    gl.vertexAttribPointer(
      Cabin.a_text_coord,
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
  
    WebGLUtils.readObj("./objects/Cabin/obj/cabin.obj").then(
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

        gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Cabin.buffer_vertices);
        gl.bufferData(
          WebGL2RenderingContext.ARRAY_BUFFER,
          packed_data,
          WebGL2RenderingContext.STATIC_DRAW
        );

        Cabin.vertices = obj_result.index_vertices.length;
        Cabin.objects_mtl_ranges = obj_result.objects_ranges;
      }
    );

    // Read the textures
    fetch("objects/Cabin/Textures/bark_willow_diff_4k.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_bark_willow);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/Cabin/Textures/reed_roof_04_diff_4k.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_reed_roof);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/Cabin/Textures/rough_wood_diff_4k.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, Cabin.texture_rough_wood);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });
  }
}