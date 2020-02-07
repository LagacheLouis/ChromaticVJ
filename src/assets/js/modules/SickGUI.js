export default class SlickUI {
    constructor() {
        this.mouse = [0, 0];
        this.pressedKey = null;
        this.startPosition = [0, 0];
        this.data = {};

        window.addEventListener("mousemove", (e) => {
            this.mouse = [e.clientX, e.clientY];
            if(this.pressedKey){
                let delta = [this.startPosition[0] - this.mouse[0], this.startPosition[1] - this.mouse[1]];
                this.startPosition = [...this.mouse];
                for (let [key, data] of Object.entries(this.data)) {
                    if (data.keyCode == this.pressedKey) {
                        data.value += delta[1]/(window.innerHeight * 0.5) * data.max;
                        if(data.value < data.min){
                            data.value = data.min;
                        }else if(data.value > data.max){
                            data.value = data.max;
                        }
                    }
                }
            }
        });
        window.addEventListener("keydown", (e) => {
            if (this.pressedKey == null) {
                this.pressedKey = e.keyCode;
                this.startPosition = [...this.mouse];
            }
        });
        window.addEventListener("keyup", (e) => {
            this.pressedKey = null;
        });
    }

    add({ name, keyCode, value = 0, min = 0, max = 1 }) {
        this.data[name] = { value, min, max, keyCode };
        return this;
    }
}