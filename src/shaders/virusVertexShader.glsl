#version 300 es

precision highp float;

// Vertex attributes
layout( location=0 ) in vec4 position;
layout( location=1 ) in vec4 normal;
layout( location=2 ) in vec2 text_coord;

out vec2 f_text_coord;

// Aplica perspectiva para os pontos
uniform mat4x4 projection;

// Transforma um ponto do mundo para o sistema de coordenadas da camera
uniform mat4x4 view;

// Coordenadas do modelo, aplicado as transformacoes de translacao,
// rotacao e escala (o que posiciona o objeto no mundo).
uniform mat4x4 model;

void main() {
  gl_Position = projection * view * model * position;
  f_text_coord = text_coord;
}