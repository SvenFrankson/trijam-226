class Creep {
    constructor(pos, main) {
        this.pos = pos;
        this.main = main;
        this.radius = 10;
        this.main;
        this.speed = new Vec2(Math.random() - 0.5, Math.random() - 0.5);
        this.speed.normalizeInPlace().scaleInPlace(200);
    }
    update(dt) {
        let dp = this.speed.scale(dt);
        this.pos.addInPlace(dp);
        let points = this.main.terrain.points;
        for (let i = 0; i < points.length; i++) {
            let ptA = points[i];
            let ptB = points[(i + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            if (sqrDist < this.radius * this.radius) {
                let n = ptB.subtract(ptA).rotateInPlace(Math.PI / 2);
                if (Math.abs(n.x) > Math.abs(n.y)) {
                    this.speed.x *= -1;
                }
                else {
                    this.speed.y *= -1;
                }
                this.pos.subtractInPlace(dp);
            }
        }
        points = [...this.main.player.drawnPoints, this.main.player.pos];
        for (let i = 0; i < points.length - 1; i++) {
            let ptA = points[i];
            let ptB = points[i + 1];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            if (sqrDist < this.radius * this.radius) {
                this.main.gameover();
            }
        }
    }
    redraw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "black");
            this.svgElement.setAttribute("stroke-width", "3");
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
        this.player = new Player(new Vec2(20, 20), this);
    }
    initialize() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);
        this.testCreep = new Creep(new Vec2(500, 500), this);
        this.creeps = [];
        for (let n = 0; n < 10; n++) {
            this.creeps.push(new Creep(new Vec2(400 + 200 * Math.random(), 400 + 200 * Math.random()), this));
        }
    }
    start() {
        this.player.start();
        this._update = (dt) => {
            this.player.update(dt);
            this.creeps.forEach(creep => {
                creep.update(dt);
            });
            this.terrain.redraw();
            this.player.redraw();
            this.creeps.forEach(creep => {
                creep.redraw();
            });
            //this.testCreep.redraw();
        };
        this._mainLoop();
    }
    stop() {
        this._update = () => {
        };
    }
    gameover() {
        this.stop();
    }
}
window.addEventListener("load", () => {
    let main = new Main();
    main.initialize();
    main.start();
});
var PlayerMode;
(function (PlayerMode) {
    PlayerMode[PlayerMode["Idle"] = 0] = "Idle";
    PlayerMode[PlayerMode["Tracing"] = 1] = "Tracing";
    PlayerMode[PlayerMode["Closing"] = 2] = "Closing";
})(PlayerMode || (PlayerMode = {}));
class Player {
    constructor(pos, main) {
        this.pos = pos;
        this.main = main;
        this.mode = PlayerMode.Idle;
        this.speedValue = 200;
        this.radius = 15;
        this.currentSegmentIndex = 0;
        this.drawnPoints = [];
        this.main;
        this.speed = new Vec2(0, 0);
    }
    start() {
        document.body.addEventListener("keydown", (ev) => {
            if (ev.code === "Space") {
                this.drawnPoints.push(this.pos.clone());
                this.speed.rotateInPlace(Math.PI * 0.5);
                if (this.mode === PlayerMode.Idle) {
                    this.mode = PlayerMode.Tracing;
                }
                else {
                    this.mode = PlayerMode.Closing;
                }
            }
        });
    }
    updateCurrentSegmentIndex() {
        this.currentSegmentIndex = 0;
        let bestSqrDist = Infinity;
        let points = this.main.terrain.points;
        for (let i = 0; i < points.length; i++) {
            let ptA = points[i];
            let ptB = points[(i + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            if (sqrDist < bestSqrDist) {
                bestSqrDist = sqrDist;
                this.currentSegmentIndex = i;
            }
        }
    }
    update(dt) {
        if (this.mode === PlayerMode.Idle) {
            let points = this.main.terrain.points;
            let ptA = points[this.currentSegmentIndex];
            let ptB = points[(this.currentSegmentIndex + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            this.pos = proj;
            if (proj.subtract(ptB).lengthSquared() < 1) {
                this.currentSegmentIndex = (this.currentSegmentIndex + 1) % points.length;
            }
            this.speed = ptB.subtract(ptA).normalizeInPlace().scaleInPlace(this.speedValue);
            let dp = this.speed.scale(dt);
            this.pos.addInPlace(dp);
        }
        else if (this.mode === PlayerMode.Tracing || this.mode === PlayerMode.Closing) {
            let dp = this.speed.scale(dt);
            this.pos.addInPlace(dp);
            let points = this.main.terrain.points;
            for (let i = 0; i < points.length; i++) {
                if (this.mode === PlayerMode.Closing || i != this.currentSegmentIndex) {
                    let ptA = points[i];
                    let ptB = points[(i + 1) % points.length];
                    let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
                    let sqrDist = this.pos.subtract(proj).lengthSquared();
                    if (sqrDist < 5) {
                        let prev = this.currentSegmentIndex;
                        this.currentSegmentIndex = i;
                        this.drawnPoints.push(proj);
                        this.main.terrain.replace(prev, this.currentSegmentIndex, this.drawnPoints);
                        this.mode = PlayerMode.Idle;
                        this.updateCurrentSegmentIndex();
                        this.drawnPoints = [];
                        return;
                    }
                }
            }
        }
    }
    redraw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "black");
            this.svgElement.setAttribute("stroke-width", "3");
            this.svgElement.setAttribute("fill", "yellow");
            this.main.container.appendChild(this.svgElement);
        }
        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));
        if (!this.playerDrawnPath) {
            this.playerDrawnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.playerDrawnPath);
        }
        let d = "";
        let points = [...this.drawnPoints, this.pos];
        if (points.length > 0) {
            d = "M" + points[0].x + " " + points[0].y + " ";
            for (let i = 1; i < points.length; i++) {
                d += "L" + points[i].x + " " + points[i].y + " ";
            }
        }
        this.playerDrawnPath.setAttribute("stroke", "grey");
        this.playerDrawnPath.setAttribute("fill", "none");
        this.playerDrawnPath.setAttribute("stroke-width", "5");
        this.playerDrawnPath.setAttribute("d", d);
    }
}
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
    replace(start, end, points) {
        if (start === end) {
            this.points.splice(start + 1, 0, ...points.reverse());
        }
        else if (end < start) {
            this.points.splice(end + 1, start - end, ...points.reverse());
        }
        else if (start < end) {
            this.points = this.points.slice(start + 1);
            this.points = this.points.splice(0, end - start);
            this.points.push(...points.reverse());
        }
    }
    redraw() {
        if (!this.path) {
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.path);
        }
        if (!this.zero) {
            this.zero = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.zero.setAttribute("r", "5");
            this.zero.setAttribute("stroke", "black");
            this.zero.setAttribute("stroke-width", "3");
            this.zero.setAttribute("fill", "white");
            this.main.container.appendChild(this.zero);
        }
        this.zero.setAttribute("cx", this.points[0].x.toFixed(1));
        this.zero.setAttribute("cy", this.points[0].y.toFixed(1));
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
    clone() {
        return new Vec2(this.x, this.y);
    }
    static Dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    addInPlace(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    subtractInPlace(other) {
        this.x -= other.x;
        this.y -= other.y;
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
    rotate(alpha) {
        return this.clone().rotateInPlace(alpha);
    }
    rotateInPlace(alpha) {
        let x = Math.cos(alpha) * this.x - Math.sin(alpha) * this.y;
        let y = Math.cos(alpha) * this.y + Math.sin(alpha) * this.x;
        this.x = x;
        this.y = y;
        return this;
    }
    static ProjectOnABLine(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let tmp = pt.subtract(ptA);
        let dot = Vec2.Dot(dir, tmp);
        let proj = dir.scaleInPlace(dot).addInPlace(ptA);
        return proj;
    }
    static ProjectOnABSegment(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let proj = Vec2.ProjectOnABLine(pt, ptA, ptB);
        let tmpA = pt.subtract(ptA);
        if (Vec2.Dot(tmpA, dir) < 0) {
            return ptA.clone();
        }
        else {
            let invDir = dir.scale(-1);
            let tmpB = pt.subtract(ptB);
            if (Vec2.Dot(tmpB, invDir) < 0) {
                return ptB.clone();
            }
        }
        return proj;
    }
}
