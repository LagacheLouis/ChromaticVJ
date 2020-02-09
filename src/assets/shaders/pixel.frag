#ifdef GL_ES
precision mediump float;
#endif
// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

// our texture sampler (default sampler name)
uniform sampler2D uSampler0;
uniform mat4 uTextureMatrix0;

uniform float uTime;
uniform float uIntensity;
uniform float uVolume;
uniform float uDifference;
uniform float uRotate;
uniform float uSlices;
uniform float uZoom;
uniform float uAber;

const float pi = 3.14159;
const float globalFactor = 1.0;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float luminance(vec3 color){
    return 0.2126 * color.r + 0.7152*color.g + 0.0722*color.b;
}

vec2 rotateUV(vec2 uv, float rotation)
{
    float mid = 0.5;
    return vec2(
        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
    );
}

float circle(vec2 uv, float size){
    float dist = distance(uv * vec2(1.0,9./16.), vec2(0.));
    return 1. - smoothstep(0.5 * size  - 0.2,0.5 * size,dist);
}


float Hash21(vec2 p) {
    p = fract(p*vec2(123.34, 456.21));
    p += dot(p, p+45.32);
    return fract(p.x*p.y);
}


void main() {
    vec2 t = vec2(0.,-uTime);
    // map our texture with the original texture coords
    vec2 uv = vTextureCoord;

    float pixel = 400.;

    vec2 px = uv * pixel;
    //
    //vec4 tex = texture2D(uSampler0, uvcolor );   
    //

    vec2 id = floor(px);

    vec2 gv = fract(px) - 0.5;
    vec3 c = vec3(0.);
    for(int x= -2; x<=2; x++){
        for(int y= -2; y<=2; y++){
            vec2 offset = vec2(x,y);
 
            vec4 tex = texture2D(uSampler0, floor(px + offset) * 1./pixel );   
            float l =  clamp(luminance(tex.rgb) + 0.5 ,0.0, 1.);
            float n1 = snoise((id + offset)/5. + t *  l * 1.) * 2. * (1.1-l);
            float n2 = snoise((id + offset)/5. + t  * l * 1. + 100.) * 2. * (1.1-l);
            vec2 fv = gv - offset + 0.5;
            c += circle(fv - vec2(n1,n2),0.5 * l + 0.3) * tex.rgb;
        }
    }
   // if(gv.x>.47 || gv.y>.47) c.r = 1.;
    //c.rg += id * .1;

    gl_FragColor = vec4(c,1.0);
}