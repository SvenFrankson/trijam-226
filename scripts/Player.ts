enum PlayerMode {
    Idle,
    Tracing,
    Closing
}

class Player extends Gameobject {

    public mode: PlayerMode = PlayerMode.Idle;
    public speedValue: number = 150;
    public speed: Vec2 = new Vec2(0, 0);
    public radius: number = 15;
    public svgElement: SVGCircleElement;
    public svgDirElement: SVGPathElement;
    public playerDrawnPath: SVGPathElement;
    public currentSegmentIndex: number = 0;
    public drawnPoints: Vec2[] = [];
    public engineSound: Sound;
    public turnSound: Sound;

    constructor(pos: Vec2, main: Main) {
        super({
                pos: pos
            },
            main
        );
    }

    public instantiate(): void {
        super.instantiate();
        
        this.addComponent(new CircleRenderer(this, { radius: this.radius }));
        this.addComponent(new PathRenderer(this, { d: "M-12 -25 L0 -40 L12 -25 Z" }));

        document.body.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("pointerup", this._onPointerUp);

        this.engineSound = this.addComponent(new Sound(this, { fileName: "spaceEngine_002.ogg", loop: true })) as Sound;
        this.turnSound = this.addComponent(new Sound(this, { fileName: "forceField_000.ogg" })) as Sound;
    }

    public dispose(): void {
        super.dispose();
        document.body.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("pointerup", this._onPointerUp);
    }

    public start(): void {
        this.pos.x = 40;
        this.pos.y = 40;
    }

    private _action(): void {
        if (this.drawnPoints.length === 0 || Vec2.DistanceSquared(this.pos, this.drawnPoints[this.drawnPoints.length - 1]) > this.radius * this.radius) {
            this.drawnPoints.push(new Vec2(
                Math.round(this.pos.x),
                Math.round(this.pos.y)
            ));
            this.turnSound.play();
            this.speed.rotateInPlace(Math.PI * 0.5);
            if (this.mode === PlayerMode.Idle) {
                this.mode = PlayerMode.Tracing;
                this.engineSound.play();
            }
            else {
                this.mode = PlayerMode.Closing;
            }
        }
    }

    private _onKeyDown = (ev: KeyboardEvent) => {
        if (ev.code === "Space") {
            this._action();
        }
    }

    private _onPointerUp = () => {
        this._action();
    }

    public updateCurrentSegmentIndex(): void {
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

    public update(dt: number): void {
        let targetDir = 0;
        if (Math.abs(this.speed.x) > Math.abs(this.speed.y)) {
            targetDir = this.speed.x > 0 ? Math.PI : 0;
        }
        else {
            targetDir = this.speed.y > 0 ? (3 * Math.PI / 2) : Math.PI / 2;
        }
        this.rot = SMath.StepFromToCirular(this.rot, targetDir, Math.PI * dt * 4);

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

            for (let i = 0; i < this.drawnPoints.length - 2; i++) {
                let ptA = this.drawnPoints[i];
                let ptB = this.drawnPoints[i + 1];
                let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
                
                let sqrDist = this.pos.subtract(proj).lengthSquared();
                
                if (sqrDist < this.radius * this.radius) {
                    this.main.gameover();
                }
            }

            let points = this.main.terrain.points
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
                        let surface = this.main.terrain.replace(prev, this.currentSegmentIndex, this.drawnPoints);
                        surface = Math.floor(surface / 100);
                        this.main.setScore(this.main.score + Math.pow(surface, 1.2));
                        this.mode = PlayerMode.Idle;
                        this.engineSound.pause();
                        this.turnSound.play();
                        this.updateCurrentSegmentIndex();
                        this.drawnPoints = [];
                        return;
                    }
                }
            }
        }
    }

    public redraw(): void {
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

        this.playerDrawnPath.setAttribute("stroke", "white");
        this.playerDrawnPath.setAttribute("fill", "none");
        this.playerDrawnPath.setAttribute("stroke-width", "4");
        this.playerDrawnPath.setAttribute("d", d);
    }
}