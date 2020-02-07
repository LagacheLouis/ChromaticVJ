import fragment from './shader.frag';
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
        difference: {
            name: "uDifference",
            type: "1f",
            value: 0,
        },
        rotate: {
            name: "uRotate",
            type: "1f",
            value: 0.1,
        },
        slices: {
            name: "uSlices",
            type: "1f",
            value: 2,
        },
        zoom: {
            name: "uZoom",
            type: "1f",
            value: 2,
        }
    }
}