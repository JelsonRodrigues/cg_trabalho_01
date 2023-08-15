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
  public buffer_control_points : WebGLBuffer;
  public buffer_pyramid_vertices : WebGLBuffer;
  public buffer_pyramid_indices : WebGLBuffer;
  
  // Vertex Array Objects
  public vao_pyramid : WebGLVertexArrayObject;

  constructor (canva : HTMLCanvasElement, vsSource : string, fsSource : string) {
    this.gl = canva.getContext("webgl2") as WebGL2RenderingContext;
    this.gl.enable(this.gl.DEPTH_TEST);
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
    this.buffer_control_points = this.gl.createBuffer() as WebGLBuffer;
    this.buffer_pyramid_vertices = this.gl.createBuffer() as WebGLBuffer;
    this.buffer_pyramid_indices = this.gl.createBuffer() as WebGLBuffer;
    

    this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_triangle_vertices);
  
    const data = [
      // left column front
      0,   0,  0,
      30,   0,  0,
       0, 150,  0,
       0, 150,  0,
      30,   0,  0,
      30, 150,  0,

     // top rung front
      30,   0,  0,
     100,   0,  0,
      30,  30,  0,
      30,  30,  0,
     100,   0,  0,
     100,  30,  0,

     // middle rung front
      30,  60,  0,
      67,  60,  0,
      30,  90,  0,
      30,  90,  0,
      67,  60,  0,
      67,  90,  0,

     // left column back
       0,   0,  30,
      30,   0,  30,
       0, 150,  30,
       0, 150,  30,
      30,   0,  30,
      30, 150,  30,

     // top rung back
      30,   0,  30,
     100,   0,  30,
      30,  30,  30,
      30,  30,  30,
     100,   0,  30,
     100,  30,  30,

     // middle rung back
      30,  60,  30,
      67,  60,  30,
      30,  90,  30,
      30,  90,  30,
      67,  60,  30,
      67,  90,  30,

     // top
       0,   0,   0,
     100,   0,   0,
     100,   0,  30,
       0,   0,   0,
     100,   0,  30,
       0,   0,  30,

     // top rung right
     100,   0,   0,
     100,  30,   0,
     100,  30,  30,
     100,   0,   0,
     100,  30,  30,
     100,   0,  30,

     // under top rung
     30,   30,   0,
     30,   30,  30,
     100,  30,  30,
     30,   30,   0,
     100,  30,  30,
     100,  30,   0,

     // between top rung and middle
     30,   30,   0,
     30,   30,  30,
     30,   60,  30,
     30,   30,   0,
     30,   60,  30,
     30,   60,   0,

     // top of middle rung
     30,   60,   0,
     30,   60,  30,
     67,   60,  30,
     30,   60,   0,
     67,   60,  30,
     67,   60,   0,

     // right of middle rung
     67,   60,   0,
     67,   60,  30,
     67,   90,  30,
     67,   60,   0,
     67,   90,  30,
     67,   90,   0,

     // bottom of middle rung.
     30,   90,   0,
     30,   90,  30,
     67,   90,  30,
     30,   90,   0,
     67,   90,  30,
     67,   90,   0,

     // right of bottom
     30,   90,   0,
     30,   90,  30,
     30,  150,  30,
     30,   90,   0,
     30,  150,  30,
     30,  150,   0,

     // bottom
     0,   150,   0,
     0,   150,  30,
     30,  150,  30,
     0,   150,   0,
     30,  150,  30,
     30,  150,   0,

     // left side
     0,   0,   0,
     0,   0,  30,
     0, 150,  30,
     0,   0,   0,
     0, 150,  30,
     0, 150,   0,
    ];

    this.gl.bufferData(
      WebGL2RenderingContext.ARRAY_BUFFER, 
      new Float32Array(data), 
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

    this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
    this.gl.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 16*6);
  }

  public drawControlPoints(number_points: number, model : mat4, view : mat4, projection : mat4) {
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_control_points);

    this.gl.enableVertexAttribArray(this.a_position);
    this.gl.vertexAttribPointer(this.a_position, 3, WebGL2RenderingContext.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.uniformMatrix4fv(this.u_model, false, model);
    this.gl.uniformMatrix4fv(this.u_view, false, view);
    this.gl.uniformMatrix4fv(this.u_projection, false, projection);

    this.gl.drawArrays(WebGL2RenderingContext.LINE_STRIP, 0, number_points);
  }

  public drawPyramid(model : mat4, view : mat4, projection : mat4) {
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_pyramid_vertices);

    this.gl.enableVertexAttribArray(this.a_position);
    this.gl.vertexAttribPointer(this.a_position, 3, WebGL2RenderingContext.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.uniformMatrix4fv(this.u_model, false, model);
    this.gl.uniformMatrix4fv(this.u_view, false, view);
    this.gl.uniformMatrix4fv(this.u_projection, false, projection);

    // this.gl.drawElements(WebGL2RenderingContext.TRIANGLES, 6*3, 0, );
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
  export async function readObj(filePath:string) : Promise<[Array<number>, Array<number>, Array<number>, Array<number>, Array<number>, Array<number>]> {
    const obj_content = await readFile(filePath);

    const vertexArray = new Array();
    const vertexTextCoordArray = new Array();
    const vertexNormalArray = new Array();

    const vertexIndexArray = new Array();
    const vertexIndexTextCoordArray = new Array();
    const vertexIndexNormalArray = new Array();

    obj_content.split(/\n/).map((line) => {
      let elements = line.trim().split(/\s+/);
      if (elements[0] == 'v') {
        for (let index = 1; index < elements.length; ++index) {
          const number = parseFloat(elements[index]);
          vertexArray.push(number);
        }
      }
      else if (elements[0] == 'vt'){
        for (let index = 1; index < elements.length; ++index) {
          const number = parseFloat(elements[index]);
          vertexTextCoordArray.push(number);
        }
      }
      else if (elements[0] == 'vn') {
        for (let index = 1; index < elements.length; ++index) {
          const number = parseFloat(elements[index]);
          vertexNormalArray.push(number);
        }
      }
      // Handle when square is used
      else if (elements[0] == 'f') {
        for (let index = 1; index < elements.length; ++index) {
          const values = elements[index].trim().split(/\//);
          if (values.length >= 1) {
            vertexIndexArray.push(parseInt(values[0]) - 1);
          }
          if (values.length >= 2) {
            vertexIndexTextCoordArray.push(parseInt(values[1]) - 1);
          }
          if (values.length >= 3) {
            vertexIndexNormalArray.push(parseInt(values[2]) - 1);
          }
        }
      }
    });
  
    return [vertexArray, vertexTextCoordArray, vertexNormalArray, 
            vertexIndexArray, vertexIndexTextCoordArray, vertexIndexNormalArray];
  }
  }
  
export default WebGLUtils;