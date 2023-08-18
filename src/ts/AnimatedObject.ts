import * as glm from "gl-matrix";

export interface AnimatedObject {
  updateAnimation(fElapsedTime:number) : void;
  resetAnimation() : void;
  toggleAnimation() : void;
  pauseAnimation() : void;
  resumeAnimation() : void;
}