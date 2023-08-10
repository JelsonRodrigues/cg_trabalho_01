import * as glm from "gl-matrix";

export abstract class DrawableObject {
  public model : glm.mat4 = glm.mat4.create();
  public program? : WebGLProgram;

  // This function sould setup any VAO and call the drawArrays or drawElements
  public draw?(gl : WebGL2RenderingContext, view : glm.mat4, projection : glm.mat4) : void; 
  // This function should setup the data for the object, ex.: read .obj, create and VAOs, upload data
  public setup?(gl : WebGL2RenderingContext) : void;
}
