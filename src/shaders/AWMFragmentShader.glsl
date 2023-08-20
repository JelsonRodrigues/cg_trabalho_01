#version 300 es

precision highp float;

uniform vec3 u_light_position;

in vec2 f_text_coord;
in vec3 f_normal;
out vec4 outColor;

uniform sampler2D u_texture;

void main(){
  outColor = vec4( dot(f_normal.xyz, u_light_position) * texture(u_texture, f_text_coord).rgb, 1.0);
}