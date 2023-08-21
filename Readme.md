# Trabalho 01 de Computacao Grafica

# Run 
You can run locally following the instructions bellow or access the link [CG Trabalho 01](https://jelsonrodrigues.github.io/cg_trabalho_01/)<br>
```
git clone https://github.com/JelsonRodrigues/cg_trabalho_01
cd cg_trabalho_01
npm install
tsc
npx webpack
node src/server/server.js
```
Now you can just open your browser in [http://localhost:3000](http://localhost:3000)

# Demo

https://github.com/JelsonRodrigues/cg_trabalho_01/assets/88675696/5d013193-4fa7-429a-8a8c-aa4ec3bf807b

# Commands
**v** Cycle through the cameras <br>
**c** Center view to origin of the world (look_at = [0, 0, 0]) <br>
**left click** Orbit camera with mouse <br>
**midlle click** Look arround with mouse <br>
**right shift** Move camera upwards <br>
**right control** Move camera downwards <br>
**arrow left** Move camera to the left <br>
**arrow right** Move camera to the right <br>
**arrow up** Move camera fowards <br>
**arrow down** Move camera backwards <br>
**scrool** Zoom in/out <br>

# Todo!
- [x] Create folders skeleton
- [x] Create matrix handling functions
- [x] Create vector handling functions
- [X] Create spline functions
- [X] Create turn G0, G1, G2 functions
- [X] Create html skeleton
    - [x] Create canvas
    - [X] Create button to animate
- [x] Create the projection matrix
- [X] Read a WebGL Texture (How?)
- [X] Create the world
    - [X] Define what scene will look like
    - [X] Define what is the camera path
    - [X] Define position and size of objects
- [X] Animate objects in the world
- [X] Add running instructions
