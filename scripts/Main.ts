class Main {

    public container: SVGElement;
    public layers: SVGGElement[] = [];
    public terrain: Terrain;
    public player: Player;
    public score: number = 0;
    public gameobjects: UniqueList<Gameobject> = new UniqueList<Gameobject>();

    constructor() {
        this.terrain = new Terrain(this);
    }

    public instantiate(): void {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);

        for (let i = 0; i < 4; i++) {
            let layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.appendChild(layer);
            this.layers[i] = layer;
        }

        this.player = new Player(new Vec2(20, 20), this);

        this.terrain.points = [
            new Vec2(40, 40),
            new Vec2(960, 40),
            new Vec2(960, 960),
            new Vec2(40, 960),
        ];
        this.terrain.redraw();

        this.player = new Player(new Vec2(0, 0), this);
        this.player.instantiate();

        for (let n = 0; n < 10; n++) {
            let creeper = new Creep(this);
            creeper.instantiate();
        }

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
        this.terrain.pointsCut = [];
        this.setScore(0);
        this.layers[0].removeChild(this.terrain.path);
        this.layers[0].removeChild(this.terrain.pathCut);
        delete this.terrain.path;
        delete this.terrain.pathCut;

        this.terrain.redraw();
        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });

        this._update = (dt: number) => {
            this.player.update(dt);
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.terrain.redraw();
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRot();
            });
            //this.testCreep.redraw();
        }
    }

    public stop(): void {
        this._update = () => {

        }
        this.gameobjects.forEach(gameobject => {
            gameobject.stop();
        });
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

    public dispose(): void {
        while (this.gameobjects.length > 0) {
            this.gameobjects.get(0).dispose();
        }
    }

    private _update: (dt: number) => void;
}

window.addEventListener("load", () => {
    document.getElementById("game-over").style.display = "none";
    let main = new Main();
    main.instantiate();
    document.getElementById("play").addEventListener("pointerup", () => {
        requestAnimationFrame(() => {
            main.start();
        });
    });
});