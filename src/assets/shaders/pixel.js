import fragment from './pixel.frag';
import vertex from './shader.vert';
export default {
    vertex: vertex,
    fragment: fragment,
    uniforms: {
        time: {
            name: "uTime",
            type: "1f",
            value: 0,
        },
        volume: {
            name: "uVolume",
            type: "1f",
            value: 0,
        }
    }
}