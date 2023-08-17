import * as glm from "gl-matrix";
import { DrawableObject } from "./DrawableObject";
import { AnimatedObject } from "./AnimatedObject";

export class ObjectTree implements DrawableObject, AnimatedObject {
  
  public objects : Array<DrawableObject> = new Array();
  
  draw(gl: WebGL2RenderingContext, view: glm.mat4, projection: glm.mat4): void {
    let model = glm.mat4.create();

    // this.objects.forEach((object) => {
    //   const object_model_copy = glm.mat4.clone(object.model)
    // });
  }

  updateAnimation(fElapsedTime: number): void {
    throw new Error("Method not implemented.");
  }
  resetAnimation(): void {
    throw new Error("Method not implemented.");
  }
  toggleAnimation(): void {
    throw new Error("Method not implemented.");
  }

}