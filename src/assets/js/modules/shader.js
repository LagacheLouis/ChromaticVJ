export default {
    vertex: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        // those are the mandatory attributes that the lib sets
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        // those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        // our texture matrix uniform (this is the lib default name, but it could be changed)
        uniform mat4 uTextureMatrix0;

        // if you want to pass your vertex and texture coords to the fragment shader
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;

        void main() {
            vec3 vertexPosition = aVertexPosition;

            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

            // set the varyings
            // thanks to the texture matrix we will be able to calculate accurate texture coords
            // so that our texture will always fit our plane without being distorted
            vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
            vVertexPosition = vertexPosition;
        }
    `,
    fragment: `
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
            float slices = 4.0;
            vec2 uv = textureCoord;
            uv = rotateUV(uv, uTime * 0.1);
            vec2 dir = vec2(0.5) - uv;
            uv = uv + dir * length(dir) *  strength;
            uv -= 0.5;
            float r = length(uv);
            float angle = atan(uv.y, uv.x);
        
            float slice = 6.28 / slices;
            
            angle = mod(angle, slice);
            angle = abs(angle - .5 * slice);

            uv = vec2(cos(angle), sin(angle)) * r;
            uv = fract(uv * 2.);
            uv = rotateUV(uv, uTime * 0.1);
            return uv;
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

            vec4 color = vec4(r,g,b,1.0);
            

            //vec4 color = texture2D(uSampler0,uv);

            gl_FragColor = color;
        }
    `,
    uniforms: {
        time: {
            name: "uTime",
            type: "1f",
            value: 0,
        },
        difference: {
            name: "uDifference",
            type: "1f",
            value: 0,
        },
    }
}