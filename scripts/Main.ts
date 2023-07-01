class Main {

    public container: SVGElement;
    public terrain: Terrain;
    public creeps: Creep[] = [];

    constructor() {
        this.terrain = new Terrain(this);
    }

    public initialize(): void {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);

        this.creeps = [
            new Creep(new Vec2(500, 500), this)
        ];

        this._update = (dt: number) => {
            this.creeps.forEach(creep => {
                creep.update(dt);
            });

            this.terrain.redraw();
            this.creeps.forEach(creep => {
                creep.redraw();
            });
        }
        this._mainLoop();
    }

    private _lastT: number = 0;
    private _mainLoop = () => {
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
    }

    private _update: (dt: number) => void;
}

window.addEventListener("load", () => {
    let main = new Main();
    main.initialize();
});