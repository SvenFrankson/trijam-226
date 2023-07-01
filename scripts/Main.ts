class Main {

    public container: SVGElement;
    public terrain: Terrain;
    public player: Player;
    public creeps: Creep[] = [];
    public testCreep: Creep;

    constructor() {
        this.terrain = new Terrain(this);
        this.player = new Player(new Vec2(20, 20), this);
    }

    public initialize(): void {
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

    public start(): void {
        this.player.start();

        this._update = (dt: number) => {
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
        }
        this._mainLoop();
    }

    public stop(): void {
        this._update = () => {

        }
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

    public gameover(): void {
        this.stop();
    }

    private _update: (dt: number) => void;
}

window.addEventListener("load", () => {
    let main = new Main();
    main.initialize();
    main.start();
});