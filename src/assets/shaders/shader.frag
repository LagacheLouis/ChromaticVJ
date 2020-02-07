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

const float pi = 3.14159;
const float globalFactor = 1.0;

vec2 rotateUV(vec2 uv, float rotation)
{
    float mid = 0.5;
    return vec2(
        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
    );
}

vec2 ko(vec2 textureCoord,float strength){
    vec2 uv = textureCoord;
    vec2 dir = vec2(0.5) - uv;
    uv = uv + dir * length(dir) *  strength;
    uv -= 0.5;

    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    float slice = (pi * 2.)/ uSlices;//1. / uSlices;

   // angle = mod(angle, 1./slice);

    
    angle = mod(angle, slice);
    angle = angle - 0.5 * slice;
    angle = abs(angle);


    vec2 angleUv = vec2(cos(angle), sin(angle)) * r;
    angleUv = fract(angleUv * uZoom);
    angleUv = rotateUV(angleUv, uRotate);
   // return vec2(angle, angle);
    return angleUv;
}

void main() {
    // map our texture with the original texture coords
    vec2 uv = vTextureCoord;

    vec2 uvR = ko(uv, uDifference);
    vec2 uvG = ko(uv, uDifference * 1.1);
    vec2 uvB = ko(uv, uDifference * 1.2);

    float r = texture2D(uSampler0,uvR).r;
    float g = texture2D(uSampler0,uvG).g;
    float b = texture2D(uSampler0,uvB).b;

   // vec4 color = vec4(vec3(ko(uv, uDifference).y),1.0);
  //  vec4 color = vec4(uvR.x,uvR.y,0.0,1.0);
    vec4 color = vec4(r,g,b,1.0);
    //vec4 color = texture2D(uSampler0,uv);

    gl_FragColor = color;
}