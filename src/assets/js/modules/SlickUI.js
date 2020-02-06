export default class SlickUI{
    constructor(){
        this.mouse = {x: 0, y: 0};
        this.data = {};
        this.keyCode = null;
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            for (let [key, value] of Object.entries(this.data)) {
                console.log(`${key}: ${value.value}`);
            }
            console.log(this.keyCode);
        });
        window.addEventListener("keydown", (e)=>{
           this.keyCode = e.keyCode;
        });
        window.addEventListener("keyup", (e)=>{
            this.keyCode = null;
        });
    }

    add({name, keyCode, value}){
        this.data[name] = { value, keyCode };
        return this;
    }
}