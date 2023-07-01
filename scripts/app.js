class Creep {
    constructor(pos, main) {
        this.pos = pos;
        this.main = main;
        this.main;
        this.speed = new Vec2(Math.random() - 0.5, Math.random() - 0.5);
        this.speed.normalizeInPlace().scaleInPlace(50);
        console.log(this.speed);
    }
    update(dt) {
        this.pos.addInPlace(this.speed.scale(dt));
    }
    redraw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", "10");
            this.svgElement.setAttribute("stroke", "black");
            this.svgElement.setAttribute("fill", "red");
            this.main.container.appendChild(this.svgElement);
        }
        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));
    }
}
class Main {
    constructor() {
        this.creeps = [];
        this._lastT = 0;
        this._mainLoop = () => {
            let dt = 0;
            let t = performance.now();
            if (isFinite(this._lastT)) {
                dt = (t - this._lastT) / 1000;
            }
            this._lastT = t;
            if (this._update) {
                this._update(dt);
            }
            requestAnimationFrame(this._mainLoop);
        };
        this.terrain = new Terrain(this);
    }
    initialize() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);
        this.creeps = [
            new Creep(new Vec2(500, 500), this)
        ];
        this._update = (dt) => {
            this.creeps.forEach(creep => {
                creep.update(dt);
            });
            this.terrain.redraw();
            this.creeps.forEach(creep => {
                creep.redraw();
            });
        };
        this._mainLoop();
    }
}
window.addEventListener("load", () => {
    let main = new Main();
    main.initialize();
});
class Terrain {
    constructor(main) {
        this.main = main;
        this.points = [];
        this.points = [
            new Vec2(20, 20),
            new Vec2(980, 20),
            new Vec2(980, 980),
            new Vec2(20, 980),
        ];
    }
    redraw() {
        if (!this.path) {
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.path);
        }
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            d += "Z";
        }
        this.path.setAttribute("stroke", "black");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke-width", "5");
        this.path.setAttribute("d", d);
    }
}
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    addInPlace(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    normalizeInPlace() {
        this.scaleInPlace(1 / this.length());
        return this;
    }
    scale(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    scaleInPlace(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
}
