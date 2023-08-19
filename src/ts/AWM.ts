import { DrawableObject} from "./DrawableObject";
import * as glm from "gl-matrix";
import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/AWMVertexShader.glsl";
import fragmentSource from "../shaders/AWMFragmentShader.glsl";
import { AnimatedObject } from "./AnimatedObject";
import { Virus } from "./Virus";
import { Camera } from "./Camera";

export class AWM implements DrawableObject, AnimatedObject {
  public model : glm.mat4;
  private virus_aiming : Virus;
  private paused_animation = false;

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
  private static texture_metal_grey : WebGLTexture;
  private static texture_scope_glass : WebGLTexture;
  private static texture_sniper_body : WebGLTexture;
  private static texture_sniper_magazine : WebGLTexture;
  private static texture_sniper_rear : WebGLTexture;
  private static texture_sniper_rifle : WebGLTexture;
  private static texture_sniper_scope : WebGLTexture;

  constructor (gl : WebGL2RenderingContext, aim_at : Virus) {
    this.model = glm.mat4.create();
    glm.mat4.translate(this.model, this.model, [0, 3, 20]);
    
    this.virus_aiming = aim_at;

    if (!AWM.initialized){
      this.setup(gl);
    }
    AWM.initialized = true;
  }
  updateAnimation(fElapsedTime: number): void {
    if (!this.paused_animation) {
      const target_to = glm.mat4.targetTo(
        glm.mat4.create(), 
        glm.vec3.fromValues(
        this.model[12],
        this.model[13],
        this.model[14],
        ),
        glm.vec3.fromValues(
          this.virus_aiming.model[12],
          this.virus_aiming.model[13],
          this.virus_aiming.model[14],
          ),
        glm.vec3.fromValues(0, 1, 0),
        );

      glm.mat4.multiply(this.model, glm.mat4.create(), target_to);
    }
  }
  resetAnimation(): void {}
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
    gl.useProgram(AWM.program as WebGLProgram);

    gl.bindVertexArray(AWM.vao);
    
    gl.uniformMatrix4fv(AWM.u_model, false, this.model);
    gl.uniformMatrix4fv(AWM.u_view, false, view);
    gl.uniformMatrix4fv(AWM.u_projection, false, projection);

    AWM.objects_mtl_ranges.forEach(
      (value, key) => {
        switch (value.material) {
          case "Gun_Body":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_body);
            break;
          case "Gun_Magazine":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_magazine);
            break;
          case "Gun_Rear":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_rear);
            break;
          case "Gun_Rifle":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_rifle);
            break;
          case "Gun_Scope":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_scope);
            break;
          case "Metal_Grey":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_metal_grey);
            break;
          case "Scope_Front_Glass":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_scope_glass);
            break;
          case "Scope_Rear_Glass":
            gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_scope_glass);
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
    AWM.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(AWM.program);
    
    // Look up uniform and attributes positions
    AWM.u_model = gl.getUniformLocation(AWM.program, "model") as WebGLUniformLocation;
    AWM.u_view = gl.getUniformLocation(AWM.program, "view") as WebGLUniformLocation;
    AWM.u_projection = gl.getUniformLocation(AWM.program, "projection") as WebGLUniformLocation;
    
    AWM.a_position = gl.getAttribLocation(AWM.program, "position");
    AWM.a_normal = gl.getAttribLocation(AWM.program, "normal");
    AWM.a_text_coord = gl.getAttribLocation(AWM.program, "text_coord");
    
    // Create the vertices buffer
    AWM.buffer_vertices = gl.createBuffer() as WebGLBuffer;

    // Create the texture buffer
    AWM.texture_metal_grey = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_metal_grey);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([128, 128, 128, 128])
    );
    
    AWM.texture_scope_glass = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_scope_glass);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([0, 128, 128, 0])
    );

    AWM.texture_sniper_body = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_body);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([255, 0, 128, 255])
    );

    AWM.texture_sniper_magazine = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_magazine);
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

    AWM.texture_sniper_rear = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_rear);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([255, 0, 0, 255])
    );

    AWM.texture_sniper_rifle = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_rifle);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([64, 128, 255, 255])
    );

    AWM.texture_sniper_scope = gl.createTexture() as WebGLTexture;
    gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_scope);
    gl.texImage2D(
      WebGL2RenderingContext.TEXTURE_2D, 
      0, 
      WebGL2RenderingContext.RGBA, 
      1, 
      1, 
      0, 
      WebGL2RenderingContext.RGBA, 
      WebGL2RenderingContext.UNSIGNED_BYTE, 
      new Uint8Array([0, 255, 64, 255])
    );

    // Create the Vertex Array Object
    AWM.vao = gl.createVertexArray() as WebGLVertexArrayObject;    
    gl.bindVertexArray(AWM.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, AWM.buffer_vertices);

    // Tell it how to read Data
    gl.enableVertexAttribArray(AWM.a_position);
    gl.enableVertexAttribArray(AWM.a_normal);
    gl.enableVertexAttribArray(AWM.a_text_coord);

    gl.vertexAttribPointer(
      AWM.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.vertexAttribPointer(
      AWM.a_normal,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );
      
    gl.vertexAttribPointer(
      AWM.a_text_coord,
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      8 * Float32Array.BYTES_PER_ELEMENT, 
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    

    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
  
    WebGLUtils.readObj("./objects/AWM/AWM.obj").then(
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

          packed_data[i*8 + 6] = texture_cordinates == null ? 0 : texture_cordinates[0];
          packed_data[i*8 + 7] = texture_cordinates == null ? 0 : texture_cordinates[1];
        }

        gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, AWM.buffer_vertices);
        gl.bufferData(
          WebGL2RenderingContext.ARRAY_BUFFER,
          packed_data,
          WebGL2RenderingContext.STATIC_DRAW
        );

        AWM.vertices = obj_result.index_vertices.length;
        AWM.objects_mtl_ranges = obj_result.objects_ranges;
      }
    );

    // Read the textures
    fetch("objects/AWM/MetalGreyTexture.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_metal_grey);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/AWM/ScopeGlassTexture.png")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_scope_glass);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/AWM/SniperBodyTexture.png")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_body);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/AWM/SniperMagazineTexture.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_magazine);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/AWM/SniperRearTexture.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_rear);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/AWM/SniperRifleTexture.png")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_rifle);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });

    fetch("objects/AWM/SniperScopeTexture.jpg")
    .then(response => response.blob())
    .then(blob => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, AWM.texture_sniper_scope);
        gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
      image.src = URL.createObjectURL(blob);
    });
  }
}