import * as glm from "gl-matrix";

import { Spline } from "../modules/Spline";
import { CubicBezierCurve } from "../modules/CubicBezierCurve";
import { DrawableObject } from "./DrawableObject";
import { Camera } from "./Camera";
import { F } from "./F";
import { Pyramid } from "./Pyramid";
import { Ground } from "./Ground";
import { AWM } from "./AWM"
import { Tower } from "./Tower";
import { Virus } from "./Virus";
import { GlowKnife } from "./GlowKnife";
import { MovingCamera } from "./MovingCamera";
import { SplinePoints } from "./SplinePoints";
import { AnimatedObject } from "./AnimatedObject";
import { Cabin } from "./Cabin";
import WebGLUtils from "./WebGLUtils";

var canva : HTMLCanvasElement;
var gl : WebGL2RenderingContext;

var spline : Spline;
var objects : Array<DrawableObject> = new Array();
var animated_objects : Array<AnimatedObject> = new Array();
var cameras : Array<Camera> = new Array();
var current_camera : number = 0;

// Animation
var animation_slider : HTMLInputElement;
var start = Date.now();

var perspective = glm.mat4.create();

function canvasResize(canva:HTMLCanvasElement) {
  const widht = window.innerWidth - 25;
  const height = window.innerHeight - 50;
  canva.width = widht;
  canva.height = height;
  canva.style.width = `${widht}px`;
  canva.style.height = `${height}px`;
}

async function main() {
  // Get the slider
  animation_slider = document.getElementById("animationSlider") as HTMLInputElement;

  // Get canvas
  canva = document.getElementById("mainCanvas") as HTMLCanvasElement;
  canvasResize(canva);
  
  // Setup gl
  gl = canva.getContext("webgl2") as WebGL2RenderingContext;
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT)
  gl.viewport(0, 0, canva.width, canva.height)

  // Create the perspective matrix
  const field_of_view = Math.PI / 4.0;
  const near = 1;
  const far = 1000;
  const aspect_ratio = canva.width / canva.height;
  glm.mat4.perspective(perspective, field_of_view, aspect_ratio, near, far);

  spline = new Spline(30);
  spline.addCurve(new CubicBezierCurve(
  [52.27757263183594, 11.551797866821289, -23.164257049560547],
  [45.84561538696289, 10.66297721862793, -28.90583038330078],
  [40.53406524658203, 9.781454086303711, -33.59396743774414],
  [44.20197296142578, 8.698997497558594, -35.5297737121582],
  ));
  spline.addCurve(new CubicBezierCurve(
  [44.20197296142578, 8.698997497558594, -35.5297737121582],
  [47.80443572998047, 7.635854721069336, -37.4310417175293],
  [48.90955352783203, 10.05416488647461, -38.27435302734375],
  [48.37994384765625, 9.181713104248047, -39.0809440612793],
  ));
  spline.addCurve(new CubicBezierCurve(
  [48.37994384765625, 9.181713104248047, -39.0809440612793],
  [47.85033416748047, 8.309261322021484, -39.887535095214844],
  [44.189414978027344, 7.336818218231201, -43.279205322265625],
  [42.35816192626953, 5.894342422485352, -43.717201232910156],
  ));
  spline.addCurve(new CubicBezierCurve(
  [42.35816192626953, 5.894342422485352, -43.717201232910156],
  [40.79904556274414, 4.666228771209717, -44.09010696411133],
  [39.36396789550781, 5.339372158050537, -44.439796447753906],
  [38.611629486083984, 4.276976585388184, -43.583091735839844],
  ));
  spline.addCurve(new CubicBezierCurve(
  [38.611629486083984, 4.276976585388184, -43.583091735839844],
  [37.859291076660156, 3.21458101272583, -42.72638702392578],
  [36.42537307739258, 1.9321856498718262, -42.002220153808594],
  [36.182647705078125, 1.879789113998413, -40.75492858886719],
  ));
  spline.addCurve(new CubicBezierCurve(
  [36.182647705078125, 1.879789113998413, -40.75492858886719],
  [35.8529052734375, 1.808608055114746, -39.06047439575195],
  [35.361328125, 3.3349945545196533, -38.094757080078125],
  [35.813323974609375, 2.7125985622406006, -35.11789321899414],
  ));
  spline.addCurve(new CubicBezierCurve(
  [35.813323974609375, 2.7125985622406006, -35.11789321899414],
  [36.173160552978516, 2.2171061038970947, -32.74799728393555],
  [32.78002166748047, 1.4678065776824951, -30.63941764831543],
  [30.692184448242188, 2.765408754348755, -29.289331436157227],
  ));
  spline.addCurve(new CubicBezierCurve(
  [30.692184448242188, 2.765408754348755, -29.289331436157227],
  [25.68269920349121, 5.381699085235596, -24.932937622070312],
  [19.088518142700195, 2.6806888580322266, -23.385942459106445],
  [19.588287353515625, 3.458324432373047, -16.815017700195312],
  ));
  spline.addCurve(new CubicBezierCurve(
  [19.588287353515625, 3.458324432373047, -16.815017700195312],
  [20.088056564331055, 4.235960006713867, -10.24409294128418],
  [21.761009216308594, 5.62360954284668, -9.765114784240723],
  [17.907367706298828, 5.791231155395508, -7.105788230895996],
  ));
  spline.addCurve(new CubicBezierCurve(
  [17.907367706298828, 5.791231155395508, -7.105788230895996],
  [14.058921813964844, 5.958626747131348, -4.450047016143799],
  [11.292231559753418, 6.126474380493164, 0.30044007301330566],
  [5.988758087158203, 6.294095993041992, 2.137937545776367],
  ));
  spline.addCurve(new CubicBezierCurve(
  [5.988758087158203, 6.294095993041992, 2.137937545776367],
  [0.6852846741676331, 6.46171760559082, 3.9754350185394287],
  [-6.686426162719727, 7.619353294372559, 5.663105487823486],
  [-10.292840957641602, 6.796961307525635, 8.109070777893066],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-10.292840957641602, 6.796961307525635, 8.109070777893066],
  [-13.899255752563477, 5.974569320678711, 10.555036544799805],
  [-14.16030502319336, 5.152177333831787, 15.710256576538086],
  [-17.408811569213867, 4.329784870147705, 18.891162872314453],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-17.408811569213867, 4.329784870147705, 18.891162872314453],
  [-20.657318115234375, 3.507392406463623, 22.07206916809082],
  [-20.819738388061523, 1.9449825286865234, 29.35525894165039],
  [-25.94344139099121, 3.072634696960449, 29.539506912231445],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-25.94344139099121, 3.072634696960449, 29.539506912231445],
  [-31.0671443939209, 4.200286865234375, 29.7237548828125],
  [-37.61170959472656, 5.327939033508301, 30.266164779663086],
  [-39.344993591308594, 6.455591201782227, 24.506488800048828],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-39.344993591308594, 6.455591201782227, 24.506488800048828],
  [-41.078277587890625, 7.583243370056152, 18.74681282043457],
  [-43.16081619262695, 8.710895538330078, 11.939945220947266],
  [-41.60453414916992, 8.408514976501465, 6.633108615875244],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-41.60453414916992, 8.408514976501465, 6.633108615875244],
  [-40.04825210571289, 8.106134414672852, 1.326271891593933],
  [-40.00471878051758, 7.803753852844238, -4.169132232666016],
  [-36.93568801879883, 7.501373291015625, -9.28740119934082],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-36.93568801879883, 7.501373291015625, -9.28740119934082],
  [-33.86665725708008, 7.198992729187012, -14.405670166015625],
  [-31.977123260498047, 6.686607360839844, -23.694408416748047],
  [-27.728595733642578, 8.214268684387207, -24.642208099365234],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-27.728595733642578, 8.214268684387207, -24.642208099365234],
  [-23.48006820678711, 9.74193000793457, -25.590007781982422],
  [-19.23154067993164, 11.269591331481934, -26.53780746459961],
  [-16.999893188476562, 12.797252655029297, -25.965988159179688],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-16.999893188476562, 12.797252655029297, -25.965988159179688],
  [-14.768245697021484, 14.32491397857666, -25.394168853759766],
  [-12.536598205566406, 16.97260093688965, -24.822349548339844],
  [-10.23611831665039, 17.380237579345703, -20.28891372680664],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-10.23611831665039, 17.380237579345703, -20.28891372680664],
  [-7.935638427734375, 17.787874221801758, -15.755477905273438],
  [-2.420177459716797, 18.195510864257812, -10.52244758605957],
  [-2.7075624465942383, 23.563261032104492, -8.911391258239746],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-2.7075624465942383, 23.563261032104492, -8.911391258239746],
  [-2.9949474334716797, 28.931011199951172, -7.300334930419922],
  [-8.483508110046387, 38.82971954345703, -6.973363399505615],
  [-3.9963948726654053, 39.66651153564453, -2.25189208984375],
  ));
  spline.addCurve(new CubicBezierCurve(
  [-3.9963948726654053, 39.66651153564453, -2.25189208984375],
  [0.4907180368900299, 40.50330352783203, 2.469578742980957],
  [2.019820213317871, 42.84038543701172, 6.94907283782959],
  [6.007211685180664, 38.58612060546875, 3.8320493698120117],
  ));
  spline.addCurve(new CubicBezierCurve(
  [6.007211685180664, 38.58612060546875, 3.8320493698120117],
  [9.989109992980957, 34.33771514892578, 0.7193196415901184],
  [12.697720527648926, 29.19757080078125, -0.24747821688652039],
  [19.287948608398438, 25.823326110839844, -4.603044509887695],
  ));
  spline.addCurve(new CubicBezierCurve(
  [19.287948608398438, 25.823326110839844, -4.603044509887695],
  [25.735090255737305, 22.522342681884766, -8.864043235778809],
  [58.70952988, 12.44061852, -17.42268372],
  [52.27757263183594, 11.551797866821289, -23.164257049560547],
  ));

  // spline.turnC2Continuous();

  const spline_camera_look = new Spline();
  spline_camera_look.addCurve(new CubicBezierCurve(
  [43.84132385253906, 11.450017929077148, -30.126686096191406],
  [41.900230407714844, 11.240009307861328, -31.861360549926758],
  [49.00202178955078, 11.770055770874023, -38.764225006103516],
  [48.08986282348633, 10.78002643585205, -39.36024475097656],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [48.08986282348633, 10.78002643585205, -39.36024475097656],
  [47.177703857421875, 9.789997100830078, -39.95626449584961],
  [43.22370910644531, 8.189953804016113, -44.586509704589844],
  [41.181819915771484, 6.249911308288574, -44.10685729980469],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [41.181819915771484, 6.249911308288574, -44.10685729980469],
  [39.139930725097656, 4.309868812561035, -43.62720489501953],
  [38.269126892089844, 2.369826316833496, -40.40739059448242],
  [37.23325729370117, 2.319782257080078, -38.49576950073242],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [37.23325729370117, 2.319782257080078, -38.49576950073242],
  [36.1973876953125, 2.26973819732666, -36.58414840698242],
  [35.64409637451172, 2.219694137573242, -34.18566131591797],
  [34.125648498535156, 2.5496573448181152, -32.76090621948242],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [34.125648498535156, 2.5496573448181152, -32.76090621948242],
  [32.607200622558594, 2.8796205520629883, -31.336151123046875],
  [31.08875274658203, 3.2095837593078613, -29.911396026611328],
  [29.57030487060547, 3.5395469665527344, -28.48664093017578],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [29.57030487060547, 3.5395469665527344, -28.48664093017578],
  [28.051856994628906, 3.8695101737976074, -27.061885833740234],
  [26.533409118652344, 4.1994733810424805, -25.637130737304688],
  [25.01496124267578, 4.5294365882873535, -24.21237564086914],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [25.01496124267578, 4.5294365882873535, -24.21237564086914],
  [23.49651336669922, 4.859399795532227, -22.787620544433594],
  [21.978065490722656, 5.419361114501953, -21.362865447998047],
  [20.55430793762207, 5.519325256347656, -19.027400970458984],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [20.55430793762207, 5.519325256347656, -19.027400970458984],
  [19.440431594848633, 5.597532272338867, -17.20025062561035],
  [17.672340393066406, 5.719256401062012, -15.496366500854492],
  [15.090792655944824, 5.819221496582031, -13.253219604492188],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [15.090792655944824, 5.819221496582031, -13.253219604492188],
  [12.509244918823242, 5.919186592102051, -11.010072708129883],
  [9.92769718170166, 6.01915168762207, -8.766925811767578],
  [7.346149444580078, 6.11911678314209, -6.523778915405273],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [7.346149444580078, 6.11911678314209, -6.523778915405273],
  [4.764601707458496, 6.219081878662109, -4.280632019042969],
  [2.183053970336914, 5.469051361083984, -2.037485122680664],
  [-0.39849376678466797, 6.079004287719727, 0.20566177368164062],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-0.39849376678466797, 6.079004287719727, 0.20566177368164062],
  [-2.98004150390625, 6.688957214355469, 2.4488086700439453],
  [-5.561589241027832, 7.298910140991211, 4.69195556640625],
  [-8.347888946533203, 6.608861446380615, 6.99647331237793],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-8.347888946533203, 6.608861446380615, 6.99647331237793],
  [-11.134188652038574, 5.9188127517700195, 9.30099105834961],
  [-13.920488357543945, 5.228764057159424, 11.605508804321289],
  [-17.050533294677734, 4.538715362548828, 14.533679008483887],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-17.050533294677734, 4.538715362548828, 14.533679008483887],
  [-20.180578231811523, 3.8486666679382324, 17.461849212646484],
  [-26.572376251220703, 3.728623151779175, 20.033111572265625],
  [-29.529823303222656, 5.18857479095459, 18.180912017822266],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-29.529823303222656, 5.18857479095459, 18.180912017822266],
  [-32.48727035522461, 6.648526191711426, 16.328712463378906],
  [-35.44471740722656, 9.26848316192627, 14.476513862609863],
  [-34.59291458129883, 9.918436050415039, 10.802721977233887],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-34.59291458129883, 9.918436050415039, 10.802721977233887],
  [-33.741111755371094, 10.568388938903809, 7.12893009185791],
  [-32.88930892944336, 10.178324699401855, 3.4551384449005127],
  [-32.037506103515625, 10.19826602935791, -0.21865345537662506],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-32.037506103515625, 10.19826602935791, -0.21865345537662506],
  [-31.18570327758789, 10.218207359313965, -3.8924453258514404],
  [-30.795541763305664, 10.23814868927002, -8.210365295410156],
  [-28.14240837097168, 10.258090019226074, -10.891977310180664],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-28.14240837097168, 10.258090019226074, -10.891977310180664],
  [-25.489274978637695, 10.278031349182129, -13.573589324951172],
  [-22.47441864013672, 10.297972679138184, -17.02860450744629],
  [-16.039573669433594, 10.317914009094238, -15.837959289550781],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-16.039573669433594, 10.317914009094238, -15.837959289550781],
  [-9.604728698730469, 10.337855339050293, -14.647314071655273],
  [-1.8628361225128174, 12.487783432006836, -14.484969139099121],
  [-2.0826168060302734, 15.267728805541992, -13.299917221069336],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-2.0826168060302734, 15.267728805541992, -13.299917221069336],
  [-2.3023974895477295, 18.04767417907715, -12.11486530303955],
  [-5.011388778686523, 21.557634353637695, -11.276493072509766],
  [-4.485385894775391, 23.60756492614746, -9.117020606994629],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-4.485385894775391, 23.60756492614746, -9.117020606994629],
  [-3.959383010864258, 25.657495498657227, -6.957548141479492],
  [-3.362985134124756, 29.767473220825195, -4.433291435241699],
  [-3.5032424926757812, 29.757356643676758, -2.032350540161133],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-3.5032424926757812, 29.757356643676758, -2.032350540161133],
  [-3.6434998512268066, 29.74724006652832, 0.368590384721756],
  [-4.328841209411621, 29.737123489379883, 2.5868186950683594],
  [-1.0285816192626953, 29.727006912231445, 2.48535418510437],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [-1.0285816192626953, 29.727006912231445, 2.48535418510437],
  [2.2716779708862305, 29.716890335083008, 2.383889675140381],
  [6.142961502075195, 31.126792907714844, 3.31345796585083],
  [8.872197151184082, 28.66663360595703, 2.180960178375244],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [8.872197151184082, 28.66663360595703, 2.180960178375244],
  [11.601432800292969, 26.20647430419922, 1.0484623908996582],
  [14.217976570129395, 23.746315002441406, 1.0165657997131348],
  [17.059904098510742, 21.286155700683594, -1.2165331840515137],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [17.059904098510742, 21.286155700683594, -1.2165331840515137],
  [19.935155868530273, 18.797149658203125, -3.4758167266845703],
  [23.172927856445312, 16.36583709716797, -4.57027006149292],
  [27.44634246826172, 15.385711669921875, -7.8663835525512695],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [27.44634246826172, 15.385711669921875, -7.8663835525512695],
  [31.719757080078125, 14.405586242675781, -11.162496566772461],
  [38.95112609863281, 13.425460815429688, -11.782148361206055],
  [41.66248321533203, 12.445335388183594, -16.90867042541504],
  ));
  spline_camera_look.addCurve(new CubicBezierCurve(
  [41.66248321533203, 12.445335388183594, -16.90867042541504],
  [44.37384033203125, 11.4652099609375, -22.035192489624023],
  [48.80209732055664, 10.485084533691406, -26.600013732910156],
  [43.84132385253906, 11.450017929077148, -30.126686096191406]
  ));
  
  const moving_camera = new MovingCamera([0, 1, 0], spline, 60000, spline_camera_look, animation_slider);

  cameras.push(
    new Camera([15, 10, 0], [0, 0, 0], [0, 1, 0]),
    moving_camera
  );

  animated_objects.push(moving_camera);

  for (let i =0; i < 35; ++i){
    const virus = new Virus(gl);
    objects.push(virus);
    animated_objects.push(virus);
  }

  const virus_to_awm_follow = new Virus(gl, [ -25, 6, 10 ]);
  virus_to_awm_follow.time_total = 3000;
  glm.mat4.scale(virus_to_awm_follow.model, virus_to_awm_follow.model, [2.0, 2.0, 2.0]);
  objects.push(virus_to_awm_follow);
  animated_objects.push(virus_to_awm_follow);
  const awm = new AWM(gl, virus_to_awm_follow);
  glm.mat4.translate(awm.model, awm.model, [-8, 9, 3]);
  const awm2 = new AWM(gl, virus_to_awm_follow);
  awm2.model[12] -= 25;
  awm2.model[14] += 5;
  animated_objects.push(awm);
  animated_objects.push(awm2);

  const tower1 = new Tower(gl);
  const tower2 = new Tower(gl);
  glm.mat4.translate(tower2.model, tower2.model, [10, -0.1, 10]);
  
  const knife = new GlowKnife(gl);
  knife.model = glm.mat4.create();
  glm.mat4.translate(knife.model, knife.model, [35, 0, -40]);
  glm.mat4.scale(knife.model, knife.model, [0.7, 1, 0.7]);
  animated_objects.push(knife);

  objects.push(
    // new F(gl),
    // new Pyramid(gl),
    // new Ground(gl),
    new GlowKnife(gl),
    knife,
    tower1,
    tower2,
    new Cabin(gl),
    awm,
    awm2,
    // new SplinePoints(gl, spline),
  );

  setupEventHandlers();
  start = Date.now();
  animate();
}

var begin_movement : glm.vec2 = glm.vec2.create();

var index_curve_in_spline = -1;
var index_control_point_in_curve = -1;
var spline_modifiyng : SplinePoints | null = null;
var left_control_pressed = false;

function setupEventHandlers() {
  // play button
  const button = document.getElementById("playButton") as HTMLButtonElement
  button.addEventListener("click", (event) => {
    current_camera = 1;
    animated_objects.forEach(
      (object) => {
        object.resetAnimation();
        object.resumeAnimation();
      }
    );
  });

  window.addEventListener('keydown', (event) => {
    let camera = cameras[current_camera];
    const camera_position = camera.getCameraPosition();
    const camera_to_look_at_vector = glm.vec3.sub(glm.vec3.create(), camera.getCameraLookingAt(), camera_position);
    const camera_matrix = camera.getCameraMatrix();
    let new_look_at : glm.vec3;
    let vec_movement : glm.vec3;
    switch (event.code) {
      case "ArrowUp": // Translate along -z
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[8], camera_matrix[9], camera_matrix[10]), -0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ArrowDown": // Translate along z
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[8], camera_matrix[9], camera_matrix[10]), 0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ArrowRight": // Translate along +x
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]), 0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ArrowLeft": // Translate along -x
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]), -0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ShiftRight": 
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]), 0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ControlRight": 
        vec_movement = glm.vec3.create();
        glm.vec3.scale(vec_movement, glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]), -0.5);
        glm.vec3.add(camera_position, camera_position, vec_movement);
        new_look_at = glm.vec3.add(glm.vec3.create(), camera_position, camera_to_look_at_vector);
        camera.updateCameraPosition(camera_position);
        camera.updateLookAt(new_look_at);
        break;
      case "ControlLeft": 
        left_control_pressed = true;
        break;
      case "KeyV":
        camera = cameras[current_camera];
        if (camera instanceof MovingCamera) { camera.pauseAnimation(); } // Pause animation
        current_camera = (current_camera + 1) % cameras.length;
        camera = cameras[current_camera];
        if (camera instanceof MovingCamera) { camera.resumeAnimation(); } // Resume animation
        break;
      case "KeyJ":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.turnG0Continuous();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "KeyK":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.turnG1Continuous();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "KeyL":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          spline_modifiyng.spline.turnC1Continuous();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "Semicolon":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          for (let i = 0; i < spline_modifiyng.spline.getNumCurvesInSpline; ++i) {
            const curve = spline_modifiyng.spline.getCurveByIndex(i);
            curve?.getControlPoints.forEach((point)=>{
              console.log(`[${point[0]}, ${point[1]}, ${point[2]}],`);
            });
          }
        }
        break;
      case "KeyH":
        if (spline_modifiyng != null) {
          spline_modifiyng = spline_modifiyng as SplinePoints;
          const last_curve = spline_modifiyng.spline.getCurveByIndex(spline_modifiyng.spline.getNumCurvesInSpline-1);
          const last_point = last_curve?.getControlPointByIndex(3) as glm.vec3;
          const one_before_last_point = last_curve?.getControlPointByIndex(2) as glm.vec3;

          const p0 = glm.vec3.clone(last_point);
          const p0_p1_dist = glm.vec3.sub(glm.vec3.create(), last_point, one_before_last_point);
          const p1 = glm.vec3.add(glm.vec3.create(), p0, p0_p1_dist);
          const p2 = glm.vec3.add(glm.vec3.create(), p1, p0_p1_dist);
          const p3 = glm.vec3.add(glm.vec3.create(), p2, p0_p1_dist);
          spline_modifiyng.spline.addCurve(new CubicBezierCurve(p0, p1, p2, p3));
          spline_modifiyng.spline.sampleSpline();
          spline_modifiyng.updateSplinePoints(gl);
        }
        break;
      case "KeyC":
        camera.updateLookAt(glm.vec3.fromValues(0, 0, 0));
        break;
      case "KeyX":
        const look_vector = glm.vec3.sub(glm.vec3.create(), camera.getCameraLookingAt(), camera.getCameraPosition());
        const look_norm = glm.vec3.normalize(glm.vec3.create(), look_vector);
        camera.updateLookAt(glm.vec3.add(glm.vec3.create(), camera.getCameraPosition(), look_norm));
        break;
    }
  });

  window.addEventListener("keyup", (event) => {
    switch (event.code){
    case "ControlLeft": 
      left_control_pressed = false;
      break;
    }
  });

  canva.addEventListener("pointerdown", (event) => {
    begin_movement[0] = event.clientX;
    begin_movement[1] = event.clientY;
    // console.log((begin_movement[0] *2.0) / canva.width -1.0, (-begin_movement[1] * 2.0) / canva.height + 1.0);
    if (event.button == 0) {
      // Check if the click is in a control point
      const splines = objects.filter((object) => {
        return object instanceof SplinePoints;
      });
      for (let i=0; i< splines.length; ++i) {
        let spline = splines[i] as SplinePoints;
        for (let c = 0; c < spline.spline.getNumCurvesInSpline; ++c) {
          const curve = spline.spline.getCurveByIndex(c) as CubicBezierCurve;
          const num_control_points = (curve.getControlPoints as glm.vec3[]).length;
          for (let j = 0; j < num_control_points; ++j) {
            const point = curve.getControlPointByIndex(j) as glm.vec3;

            // Apply transformations and see if it would be in the same location
            const transformed_point = glm.vec3.create();
            glm.vec3.transformMat4(transformed_point, point, cameras[current_camera].getViewMatrix());
            glm.vec3.transformMat4(transformed_point, transformed_point, perspective);
            
            const dist_vec = glm.vec2.sub(
              glm.vec2.create(), 
              glm.vec2.fromValues((begin_movement[0] *2.0) / canva.width -1.0, (-begin_movement[1] * 2.0) / canva.height + 1.0), 
              glm.vec2.fromValues(transformed_point[0], transformed_point[1]) 
              );
            
            // Radius 
            // The further away the point is, the less space it will ocuppy in screen, so I 
            // Must decrease the radius acordingly to the z percentage of the point in relation
            // With the view frustum
            const dist = glm.vec2.length(dist_vec);
            const RADIUS = 0.06;

            if (dist <= RADIUS) {
              spline_modifiyng = spline;
              index_curve_in_spline = c;
              index_control_point_in_curve = j;
              canva.addEventListener("pointermove", modify_spline);
              return;
            }
          }
        }
      }

      // Otherwise 
      canva.addEventListener("pointermove", orbit_camera_with_mouse);
    }
    else if (event.button == 1) {
      canva.addEventListener("pointermove", move_camera_with_mouse);
    }
  });

  canva.addEventListener("pointerup", (event) => {
    if (event.button == 0) {
      canva.removeEventListener("pointermove", orbit_camera_with_mouse);
      canva.removeEventListener("pointermove", modify_spline);
    }
    else if (event.button == 1) {
      canva.removeEventListener("pointermove", move_camera_with_mouse);
    }
  });

  canva.addEventListener("wheel", (event) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at = camera.getCameraLookingAt();
    
    const origin_camera_vec = glm.vec3.create();
    glm.vec3.sub(origin_camera_vec,camera_position_in_world, look_at);

    const old_size = glm.vec3.len(origin_camera_vec);
    const normalized_vec = glm.vec3.create();
    glm.vec3.normalize(normalized_vec, origin_camera_vec);
    
    if (event.deltaY > 0) {
      glm.vec3.scaleAndAdd(camera_position_in_world, look_at, normalized_vec, old_size + 1.00);
    }
    else if (event.deltaY < 0) {
      glm.vec3.scaleAndAdd(camera_position_in_world, look_at, normalized_vec, old_size - 1.00);
    }

    camera.updateCameraPosition(camera_position_in_world);
  });

  const modify_spline = (event: PointerEvent) => {
    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);
    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);
    
    if (spline_modifiyng == null) { return; }
    spline_modifiyng = spline_modifiyng as SplinePoints;
    const spline = spline_modifiyng.spline;
    const curve = spline.getCurveByIndex(index_curve_in_spline) as CubicBezierCurve;
    const point = curve.getControlPointByIndex(index_control_point_in_curve) as glm.vec3;

    const camera_position_in_world = cameras[current_camera].getCameraPosition();
    const camera_to_point_vec = glm.vec3.sub(glm.vec3.create(), point, camera_position_in_world);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    if (left_control_pressed) {
      const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);
      const dot_value = glm.vec3.dot([0, 1, 0], y_axis_transformed);
      glm.vec3.scaleAndAdd(camera_to_point_vec, camera_to_point_vec, [0, 1, 0], change[1] * 0.01 * (dot_value > 0 ? -1 : 1));
    }
    else {
      const z_axis_transformed = glm.vec3.fromValues(camera_matrix[8], 0, camera_matrix[10]);
      const z_norm = glm.vec3.normalize(glm.vec3.create(), z_axis_transformed);
      glm.vec3.scaleAndAdd(camera_to_point_vec, camera_to_point_vec, z_norm, change[1] * 0.01);
      const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], 0, camera_matrix[2]);
      const x_norm = glm.vec3.normalize(glm.vec3.create(), x_axis_transformed);
      glm.vec3.scaleAndAdd(camera_to_point_vec, camera_to_point_vec, x_norm, change[0] * 0.01);
    }

    const new_point = glm.vec3.add(glm.vec3.create(), camera_position_in_world, camera_to_point_vec);
    curve.changeControlPoint(index_control_point_in_curve, new_point);
    spline.updateCurve(index_curve_in_spline, curve);
    spline_modifiyng.updateSplinePoints(gl);

    begin_movement = glm.vec2.clone(current_position);
  }

  const orbit_camera_with_mouse = (event: PointerEvent) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at_point = camera.getCameraLookingAt();
    const look_at_to_camera_position_vec = glm.vec3.create();
    glm.vec3.sub(look_at_to_camera_position_vec, camera_position_in_world, look_at_point);

    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);
    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);

    const rotation_arround_y = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_y, rotation_arround_y, change[0] * -0.01, y_axis_transformed);
    glm.vec3.transformMat4(look_at_to_camera_position_vec, look_at_to_camera_position_vec, rotation_arround_y);

    const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]);
    const rotation_arround_x = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_x, rotation_arround_x, change[1] * -0.01, x_axis_transformed);
    glm.vec3.transformMat4(look_at_to_camera_position_vec, look_at_to_camera_position_vec, rotation_arround_x);

    begin_movement = glm.vec2.clone(current_position);
    glm.vec3.add(camera_position_in_world, look_at_point, look_at_to_camera_position_vec);
    if (camera_position_in_world[1] < 0.5) camera_position_in_world[1] = 0.5; // do not let camera go underground
    camera.updateCameraPosition(camera_position_in_world);
  }

  const move_camera_with_mouse = (event: PointerEvent) => {
    const camera = cameras[current_camera];
    const camera_position_in_world = camera.getCameraPosition();
    const look_at_point = camera.getCameraLookingAt();
    const camera_position_to_look_at_vec = glm.vec3.create();
    glm.vec3.sub(camera_position_to_look_at_vec, look_at_point, camera_position_in_world);

    const current_position = glm.vec2.fromValues(event.clientX, event.clientY);
    const change = glm.vec2.create();
    glm.vec2.sub(change, current_position, begin_movement);

    const camera_matrix = cameras[current_camera].getCameraMatrix();

    const y_axis_transformed = glm.vec3.fromValues(camera_matrix[4], camera_matrix[5], camera_matrix[6]);

    const rotation_arround_y = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_y, rotation_arround_y, change[0] * -0.005, y_axis_transformed);
    glm.vec3.transformMat4(camera_position_to_look_at_vec, camera_position_to_look_at_vec, rotation_arround_y);

    const x_axis_transformed = glm.vec3.fromValues(camera_matrix[0], camera_matrix[1], camera_matrix[2]);
    const rotation_arround_x = glm.mat4.create();
    glm.mat4.rotate(rotation_arround_x, rotation_arround_x, change[1] * -0.005, x_axis_transformed);
    glm.vec3.transformMat4(camera_position_to_look_at_vec, camera_position_to_look_at_vec, rotation_arround_x);

    begin_movement = glm.vec2.clone(current_position);
    glm.vec3.add(look_at_point, camera_position_in_world, camera_position_to_look_at_vec);
    camera.updateLookAt(look_at_point);
  }
}


function animate() {

  updateAnimation();
  // Create model matrix
  const model = glm.mat4.create();
  
  let camera = cameras[current_camera];
  
  const view_matrix = camera.getViewMatrix();

  gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
  objects.forEach((drawable_obj) => {
      drawable_obj.draw(gl, view_matrix, perspective);
    }
  );
  
  requestAnimationFrame(animate);
}

var before:number = 0;
function updateAnimation() {
  const now = Date.now();
  const fElapsedTime = now - before;
  animated_objects.forEach(
    (object) => {
      object.updateAnimation(fElapsedTime);
    }
  );
  before = now;
}
window.onload = main