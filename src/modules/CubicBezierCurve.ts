import * as glm from "gl-matrix"

export class CubicBezierCurve {
  private control_points : Array<glm.vec4>;
  private coeff_vector : [glm.vec4, glm.vec4, glm.vec4, glm.vec4];

  constructor (P0 : glm.vec4, P1: glm.vec4, P2: glm.vec4, P3: glm.vec4) {
    this.control_points = new Array(P0, P1, P2, P3);
    this.coeff_vector = [glm.vec4.create(), glm.vec4.create(), glm.vec4.create(), glm.vec4.create()];
    this.calcCoeffVector(P0, P1, P2, P3);
  }

  private calcCoeffVector(P0 : glm.vec4, P1: glm.vec4, P2: glm.vec4, P3: glm.vec4){
    const coeff_values_matrix = glm.mat4.fromValues(
      1.0, 0.0, 0.0, 0.0,
      -3.0, 3.0, 0.0, 0.0,
      3.0, -6.0, 3.0, 0.0,
      -1.0, 3.0, -3.0, 1.0
    );

    glm.vec4.transformMat4(this.coeff_vector[0], P0, coeff_values_matrix);
    glm.vec4.transformMat4(this.coeff_vector[1], P1, coeff_values_matrix);
    glm.vec4.transformMat4(this.coeff_vector[2], P2, coeff_values_matrix);
    glm.vec4.transformMat4(this.coeff_vector[3], P3, coeff_values_matrix);
  }

  public getPoint(t:number) : glm.vec4 {
    const t_0 = Math.pow(t, 0);
    const t_1 = Math.pow(t, 1);
    const t_2 = Math.pow(t, 2);
    const t_3 = Math.pow(t, 3);

    const _ = glm.vec4.create();
    
    const g0_t0 = glm.vec4.scale(_, this.coeff_vector[0], t_0);
    const g1_t1 = glm.vec4.scale(_, this.coeff_vector[1], t_1);
    const g2_t2 = glm.vec4.scale(_, this.coeff_vector[2], t_2);
    const g3_t3 = glm.vec4.scale(_, this.coeff_vector[3], t_3);
    
    const res = 
      glm.vec4.add(
        _,
        glm.vec4.add(
          _,
          g0_t0,
          g1_t1,
        ),
        glm.vec4.add(
          _,
          g2_t2,
          g3_t3,
        )
      );

    return res;
  }

  public getPointTangent(t: number): glm.vec4 {
    const t_0 = 0;
    const t_1 = Math.pow(t, 0);
    const t_2 = Math.pow(t, 1);
    const t_3 = Math.pow(t, 2);

    const _ = glm.vec4.create();
    
    const g0_t0 = glm.vec4.scale(_, this.coeff_vector[0], t_0);
    const g1_t1 = glm.vec4.scale(_, this.coeff_vector[1], t_1);
    const g2_t2 = glm.vec4.scale(_, this.coeff_vector[2], t_2);
    const g3_t3 = glm.vec4.scale(_, this.coeff_vector[3], t_3);
    
    const res = 
      glm.vec4.add(
        _,
        glm.vec4.add(
          _,
          g0_t0,
          g1_t1,
        ),
        glm.vec4.add(
          _,
          g2_t2,
          g3_t3,
        )
      );

    return res;
  }

  public changeControlPoint(index:number, new_point: glm.vec4) {
    if (index < 0 || index >= this.control_points.length) { return; }

    this.control_points[index] = new_point;

    this.calcCoeffVector(this.control_points[0], this.control_points[1], this.control_points[2], this.control_points[3]);
  }

  public getControlPointByIndex(index : number) : glm.vec4 | null {
    if (index < 0 || index >= this.control_points.length) {
      return null;
    }
    return this.control_points[index];
  }

  public get getControlPoints() : Array<glm.vec4> {
    return this.control_points;
  }
}