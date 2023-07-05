class Main {

    public container: SVGElement;
    public terrain: Terrain;
    public player: Player;
    public creeps: Creep[] = [];
    public score: number = 0;

    constructor() {
        this.terrain = new Terrain(this);
    }

    public initialize(): void {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);

        this.player = new Player(new Vec2(20, 20), this);
        this.player.initialize();

        this.terrain.points = [
            new Vec2(20, 20),
            new Vec2(980, 20),
            new Vec2(980, 980),
            new Vec2(20, 980),
        ];
        this.terrain.redraw();

        this._mainLoop();
    }

    public setScore(score: number): void {
        this.score = score;
        (document.getElementsByClassName("score-value")[0] as HTMLElement).innerText = this.score.toFixed(0).padStart(5, "0");
        (document.getElementsByClassName("score-value")[1] as HTMLElement).innerText = this.score.toFixed(0).padStart(5, "0");
    }

    public start(): void {
        document.getElementById("play").style.display = "none";
        document.getElementById("game-over").style.display = "none";
        document.getElementById("credit").style.display = "none";
        this.terrain.points = [
            new Vec2(40, 40),
            new Vec2(960, 40),
            new Vec2(960, 960),
            new Vec2(40, 960),
        ];
        this.setScore(0);
        this.player.drawnPoints = [];
        this.player.currentSegmentIndex = 0;
        this.player.speed.x = 0;
        this.player.speed.y = 0;
        this.container.innerHTML = "";
        delete this.terrain.path;
        delete this.terrain.pathCut;
        delete this.player.playerDrawnPath;
        delete this.player.svgElement;
        this.creeps = [];
        for (let n = 0; n < 10; n++) {
            this.creeps.push(new Creep(new Vec2(400 + 200 * Math.random(), 400 + 200 * Math.random()), this));
        }
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

    public gameover(success?: boolean): void {
        this.stop();
        document.getElementById("play").style.display = "block";
        document.getElementById("game-over").style.display = "block";
        if (success) {
            document.getElementById("game-over").style.backgroundColor = "#0abdc6";
            document.getElementById("success-value").innerText = "SUCCESS";
        }
        else {
            document.getElementById("game-over").style.backgroundColor = "#711c91";
            document.getElementById("success-value").innerText = "GAME OVER";
        }
        document.getElementById("credit").style.display = "block";
    }

    private _update: (dt: number) => void;
}

window.addEventListener("load", () => {
    document.getElementById("game-over").style.display = "none";
    let main = new Main();
    main.initialize();
    document.getElementById("play").addEventListener("pointerup", () => {
        main.start();
    });
});