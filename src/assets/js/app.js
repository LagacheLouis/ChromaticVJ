import Audio from "./modules/Audio.js";
import AudioAnalyser from "./modules/AudioAnalyser.js";
import shader from "../shaders/shader.js";
import SickGUI from "./modules/SickGUI.js";
import { Curtains } from 'curtainsjs';

window.onload = function () {

    let audio = new Audio({
        tracklist: [
            {
                url: require("../music/caravan_palace_plume.mp3")
            }
        ]
    });
    let analyser = new AudioAnalyser({ audio: audio, fftSize: 1024 });

    analyser.debugger.on = true;


    let mouse = { x: 0, y: 0 };
    window.onmousemove = function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    window.addEventListener("click", () => {
        if (!audio.started) {
            audio.start();
        } else {
            if (mouse.x < window.innerWidth / 2) {
                audio.previousTrack();
            } else {
                audio.nextTrack();
            }
        }
    });


    // set up our WebGL context and append the canvas to our wrapper
    var webGLCurtain = new Curtains({
        container: "canvas"
    });

    // if there's any error during init, we're going to catch it here
    webGLCurtain.onError(function () {
        document.body.classList.add("no-curtains");
    });

    // get our plane element
    var planeElement = document.getElementsByClassName("curtain-plane")[0];

    // set our initial parameters (basic uniforms)
    var params = {
        vertexShader: shader.vertex,
        fragmentShader: shader.fragment,
        uniforms: shader.uniforms
    }

    // create our plane mesh
    var plane = webGLCurtain.addPlane(planeElement, params);

    let sickGUI = new SickGUI();
    sickGUI.add({ name: "rotate", keyCode: 65, value: 0.1, min: -10, max: 10 });
    sickGUI.add({ name: "slices", keyCode: 90, value: 1, min: 1, max: 100 });
    sickGUI.add({ name: "zoom", keyCode: 69, value: 0.1, min: 0 , max: 200 })

    // if our plane has been successfully created
    // we use the onRender method of our plane fired at each requestAnimationFrame call
    var last = Date.now();
    plane && plane.onRender(function () {
        let delta = (Date.now() - last) / 1000;
        last = Date.now();
        analyser.refreshData(delta);
        analyser.debug();
        let data = analyser.getData();

        console.log(sickGUI.data["slices"].value);

        plane.uniforms.time.value += delta;
        plane.uniforms.difference.value = data.difference * 0.5;
        plane.uniforms.rotate.value += delta * sickGUI.data["rotate"].value;
        plane.uniforms.slices.value = sickGUI.data["slices"].value;
        plane.uniforms.zoom.value = sickGUI.data["zoom"].value;

    });

}