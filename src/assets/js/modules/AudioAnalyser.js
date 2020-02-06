export default class AudioAnalyser {
    constructor({ audio, fftSize }) {
        this.audio = audio;
        this.context = new AudioContext();
        this.src = this.context.createMediaElementSource(this.audio.audioNode);
        this.analyser = this.context.createAnalyser();
        this.src.connect(this.analyser);

        this.analyser.connect(this.context.destination);
        this.analyser.fftSize = fftSize;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.beats = [];


        this.bpmTimer = 0;

        for (let i = 0; i < 10; i++) {
            this.beats[i] = new Beat();
        }

        this.data = {
            time: { time: 0, delta: 0 },
            volume: 0,
            rawvolume: 0,
            intensity: 0,
            difference: 0,
            color: "white",
            saturation: 0,
            onBpm: false,
            bpmNumber: 0,
            bpm: function (i) {
                return this.onBpm && this.bpmNumber > 0 && this.bpmNumber % i === 0;
            },
            trackname: "",
            artist: ""
        };

        this.audio.audioNode.addEventListener("trackset", () => {
            this.context.resume();
        });

        /*
                DEBUGGER
            */
        let debugCanvas = document.createElement("canvas");
        debugCanvas.width = window.innerWidth;
        debugCanvas.height = window.innerHeight;
        debugCanvas.style = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: 9999;
            pointer-events: none;
        `;
        document.querySelector("body").append(debugCanvas);

        this.debugger = {
            on: false,
            canvas: debugCanvas,
            ctx: debugCanvas.getContext("2d"),
        };
    }

    refreshData(time) {
        this.data.time = time;

        this.analyser.getByteFrequencyData(this.dataArray);

        for (let i = 0; i < this.beats.length; i++) {
            let _min = (i / this.beats.length) * 100;
            let _max = ((i + 1) / this.beats.length) * 100;
            let currentAverage = this.getAverage({ min: _min, max: _max });
            this.beats[i].update(currentAverage, time);
        }
        if (this.audio.isPlaying()) {
            this.bpmTimer += this.data.time.delta;
            this.data.onBpm = this.bpmTimer > 60 / this.audio.getCurrentTrack().bpm;
            if (this.data.onBpm) {
                this.bpmTimer = 0;
                this.data.bpmNumber += 1;
            }
            this.data.trackname = this.audio.getCurrentTrack().name;
            this.data.artist = this.audio.getCurrentTrack().artist;
        }

        this.data.rawvolume = this.getAverage({ min: 0, max: 100 });
        this.data.volume += (this.data.rawvolume - this.data.volume) * 0.8;
        this.data.intensity += (this.data.rawvolume - this.data.intensity) * 0.01;
        this.data.difference += ((this.data.rawvolume - this.data.intensity) * 10.0 - this.data.difference) * 0.7;
    }

    debug() {
        this.debugger.canvas.width = window.innerWidth;
        this.debugger.canvas.height = window.innerHeight;
        this.debugger.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (this.debugger.on) {
            let widthData = window.innerWidth / this.dataArray.length;
            let widthBeat = widthData * (this.bufferLength / this.beats.length);

            for (let i = 0; i < this.beats.length; i++) {
                let height = (this.beats[i].smoothedValue * window.innerHeight) / 5 + 2;
                this.debugger.ctx.fillStyle = this.beats[i].on() ? "red" : "grey";
                this.debugger.ctx.fillRect(
                    widthBeat * i + 1,
                    window.innerHeight - height,
                    widthBeat - 2,
                    height
                );
            }

            this.debugger.ctx.fillStyle = "white";
            for (let i = 0; i < this.dataArray.length; i++) {
                let height = ((this.dataArray[i] / 255) * window.innerHeight) / 5;
                this.debugger.ctx.fillRect(
                    widthData * i + 2,
                    window.innerHeight - height,
                    widthData - 1,
                    height
                );
            }
        }
    }

    extractData(range) {
        let _min = Math.floor((range.min / 100) * this.dataArray.length);
        let _max = Math.ceil((range.max / 100) * this.dataArray.length);
        return this.dataArray.slice(_min, _max);
    }

    getAverage(range) {
        let array = this.extractData(range);
        let moy = 0;
        for (let i = 0; i < array.length; i++) {
            moy += array[i];
        }
        return moy / array.length / 255;
    }

    getMax(range) {
        let array = this.extractData(range);
        return Math.max(...array) / 255;
    }

    getMin(range) {
        let array = this.extractData(range);
        return Math.min(...array) / 255;
    }

    getQuartile(range, q) {
        let array = this.extractData(range);
        array = array.sort((a, b) => {
            return a - b;
        });
        var pos = (array.length - 1) * q;
        var base = Math.floor(pos);
        var rest = pos - base;
        if (array[base + 1] !== undefined) {
            return array[base] + rest * (array[base + 1] - array[base]);
        } else {
            return array[base];
        }
    }

    getData() {
        return this.data;
    }
}

class Beat {
    constructor() {
        this.value = 0;
        this.smoothedValue = 0;
        this.beatedDelay = 0;
    }

    update(value, time) {
        if (value - 0.05 > this.smoothedValue && value > 0) {
            this.value = value;
            this.beatedDelay = 1;
        } else if (this.value > 0) {
            this.beatedDelay -= time.delta * 10;
        } else {
            this.value = 0;
        }
        this.smoothedValue += (value - this.smoothedValue) * 0.3;
    }

    on() {
        return this.beatedDelay > 0;
    }
}
