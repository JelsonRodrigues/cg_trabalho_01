import { DrawableObject} from "./DrawableObject";
import { Spline } from "../modules/Spline"
import * as glm from "gl-matrix";
import { WebGLUtils } from "./WebGLUtils";

import vertexSource from "../shaders/vertexShader.glsl";
import fragmentSource from "../shaders/fragmentShader.glsl";

export class SplinePoints implements DrawableObject {
  public model : glm.mat4;
  public spline : Spline;
  private lines : number = 0;
  private buffer_vertices : WebGLBuffer;
  private vao : WebGLVertexArrayObject;

  private static initialized : boolean = false;
  private static program : WebGLProgram;
  private static u_model : WebGLUniformLocation;
  private static u_view : WebGLUniformLocation;
  private static u_projection : WebGLUniformLocation;
  private static a_position : number;

  constructor (gl : WebGL2RenderingContext, spline : Spline) {
    this.model = glm.mat4.create();
    this.spline = spline;
    this.buffer_vertices = gl.createBuffer() as WebGLBuffer;
    this.vao = gl.createVertexArray() as WebGLVertexArrayObject;    

    if (!SplinePoints.initialized){
      this.setup(gl);
    }
    SplinePoints.initialized = true;

    this.updateSplinePoints(gl);
  }

  draw(gl: WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void {
    gl.useProgram(SplinePoints.program as WebGLProgram);

    gl.bindVertexArray(this.vao);
    
    gl.uniformMatrix4fv(SplinePoints.u_model, false, this.model);
    gl.uniformMatrix4fv(SplinePoints.u_view, false, view);
    gl.uniformMatrix4fv(SplinePoints.u_projection, false, projection);

    gl.drawArrays(
      WebGL2RenderingContext.LINE_STRIP, 
      0, 
      this.lines
      );

    // Unbind VAO to other gl calls do not modify it
    gl.bindVertexArray(null);
  } 
  
  updateSplinePoints(gl : WebGL2RenderingContext) {
    this.spline.sampleSpline();

    const data = new Float32Array(this.spline.array_points.length * 3);
    this.spline.array_points.forEach((point, index) => {
      data[index * 3 + 0] = point[0];
      data[index * 3 + 1] = point[1];
      data[index * 3 + 2] = point[2];
    });

    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);
    gl.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW);

    this.lines = this.spline.array_points.length;
  }

  setup(gl: WebGL2RenderingContext): void {
    // Create the program
    SplinePoints.program = WebGLUtils.createProgram(
      gl,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vertexSource) as WebGLShader,
      WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentSource) as WebGLShader
    ) as WebGLProgram;
    gl.useProgram(SplinePoints.program);
    
    // Look up uniform and attributes positions
    SplinePoints.u_model = gl.getUniformLocation(SplinePoints.program, "model") as WebGLUniformLocation;
    SplinePoints.u_view = gl.getUniformLocation(SplinePoints.program, "view") as WebGLUniformLocation;
    SplinePoints.u_projection = gl.getUniformLocation(SplinePoints.program, "projection") as WebGLUniformLocation;
    
    SplinePoints.a_position = gl.getAttribLocation(SplinePoints.program, "position");
    
    // Create the Vertex Array Object
    gl.bindVertexArray(this.vao);
    
    // Tell VAO what buffer to bind
    gl.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_vertices);

    // Tell it how to read Data
    gl.enableVertexAttribArray(SplinePoints.a_position);

    gl.vertexAttribPointer(
      SplinePoints.a_position,
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );
    
    // Unbind VAO buffer so other objects cannot modify it
    gl.bindVertexArray(null);
  }
}