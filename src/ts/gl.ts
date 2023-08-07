import { mat4 } from "gl-matrix";

export class gl {
  // Context
  public gl : WebGL2RenderingContext;

  // Program
  public program : WebGLProgram;
  public a_position : number;
  public a_uv_text_coord : number;
  public u_model : WebGLUniformLocation;
  public u_view : WebGLUniformLocation;
  public u_projection : WebGLUniformLocation;

  // Buffers 
  public buffer_triangle_vertices : WebGLBuffer;

  // Vertex Array Objects


  constructor (canva : HTMLCanvasElement, vsSource : string, fsSource : string) {
    this.gl = canva.getContext("webgl2") as WebGL2RenderingContext;
    this.program = gl.createProgram(
      this.gl,
      gl.createShader(this.gl, WebGL2RenderingContext.VERTEX_SHADER, vsSource) as WebGLShader,
      gl.createShader(this.gl, WebGL2RenderingContext.FRAGMENT_SHADER, fsSource) as WebGLShader
    ) as WebGLProgram;

    this.a_position = this.gl.getAttribLocation(this.program, "position");
    this.a_uv_text_coord = this.gl.getAttribLocation(this.program, "a_uv_text_coord");
    
    this.u_model = this.gl.getUniformLocation(this.program, "model") as WebGLUniformLocation;
    this.u_view = this.gl.getUniformLocation(this.program, "view") as WebGLUniformLocation;
    this.u_projection = this.gl.getUniformLocation(this.program, "projection") as WebGLUniformLocation;
  
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.buffer_triangle_vertices = this.gl.createBuffer() as WebGLBuffer;

    this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_triangle_vertices);
    this.gl.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, new Float32Array([
      -1.0, -0.0, 0.6,
      0.0, 0.6, 0.4,
      1.0, 0.0, 0.6,
      ]), 
      WebGL2RenderingContext.STATIC_DRAW
    );
  }

  public drawTriangle(model : mat4, view : mat4, projection : mat4) {
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_triangle_vertices);

    this.gl.enableVertexAttribArray(this.a_position);
    this.gl.vertexAttribPointer(this.a_position, 3, WebGL2RenderingContext.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.uniformMatrix4fv(this.u_model, false, model);
    this.gl.uniformMatrix4fv(this.u_view, false, view);
    this.gl.uniformMatrix4fv(this.u_projection, false, projection);

    this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
    this.gl.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
  }

  static createShader(gl: WebGL2RenderingContext, type : number, source:string) : WebGLShader | null{
    const shader = gl.createShader(type);
    if (shader){
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
    return null;
  }
  
  static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram | null {
    const program = gl.createProgram();
    if (program){
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
  
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }
    
      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }
    return null;
  }

} 

export module WebGLUtils {

  export const sleep = (ms : number = 0.0) => new Promise(r => setTimeout(r, ms));
  
  export async function readFile(filePath : string) : Promise<string> {
    const response = await fetch(filePath);
    const text = await response.text();
    return text;
  }
  
  /** @todo Read file in small chunks, preferable using something like 64 or 256 lines at time */
  export async function readObj(filePath:string) : Promise<[Array<number>, Array<number>, Array<number>, Array<number>]> {
    const obj_content = await readFile(filePath);
    const vertexArray = new Array();
    const colorArray = new Array();
    const vertexTextCoordArray = new Array();
    const facesIndex = new Array();
    obj_content.split("\n").map((line) => {
      let elements = line.split(" ");
      if (elements[0] == 'v') {
        for (let index = 1; index < elements.length; ++index) {
          const number = parseFloat(elements[index]);
          vertexArray.push(number);
        }
      }
      else if (elements[0] == 'c') {
        for (let index = 1; index < elements.length; ++index) {
          const number = parseFloat(elements[index]);
          colorArray.push(number);
        }
      }
      else if (elements[0] == 'vt'){
        for (let index = 1; index < elements.length; ++index) {
          const number = parseFloat(elements[index]);
          vertexTextCoordArray.push(number);
        }
      }
      else if (elements[0] == 'f') {
        for (let index = 1; index < elements.length; ++index) {
          const values = elements[index].split('/');
          for (let number = 0; number < values.length; ++number) {
            const number = parseInt(elements[index]);
            facesIndex.push(number);
          }
        }
      }
    });
  
    return [vertexArray, colorArray, vertexTextCoordArray, facesIndex];
  }
  }
  
export default WebGLUtils;