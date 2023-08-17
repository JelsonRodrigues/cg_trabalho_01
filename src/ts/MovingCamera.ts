import { Spline } from "../modules/Spline";
import { AnimatedObject } from "./AnimatedObject";
import { Camera } from "./Camera";

import * as glm from "gl-matrix";

export class MovingCamera extends Camera implements AnimatedObject {
  private camera_path : Spline;
  private time_total : number = 10_000;
  private accumulated_time : number = 0;
  private paused_animation : boolean = false;

  constructor (up_vector: glm.vec3, camera_path:Spline, time_complete_path_ms:number) {
    super(camera_path.getPoint(0.0), camera_path.getPointTangent(0.0), up_vector);
    this.camera_path = camera_path;
    this.time_total = time_complete_path_ms;
  }

  updateAnimation(fElapsedTime:number): void {
    if (!this.paused_animation) {
      this.accumulated_time = (this.accumulated_time + fElapsedTime) % this.time_total;
      const percent_animation = this.accumulated_time / this.time_total;
      super.updateCameraPosition(this.camera_path.getPoint(percent_animation));
      super.updateLookAt(this.camera_path.getPointTangent(percent_animation));
    }
  }

  resetAnimation(): void {
    this.accumulated_time = 0;
  }

  toggleAnimation(): void {
    this.paused_animation != this.paused_animation;
  }
}