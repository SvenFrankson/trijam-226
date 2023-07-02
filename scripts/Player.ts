enum PlayerMode {
    Idle,
    Tracing,
    Closing
}

class Player {

    public mode: PlayerMode = PlayerMode.Idle;
    public speedValue: number = 200;
    public speed: Vec2;
    public radius: number = 15;
    public svgElement: SVGCircleElement;
    public playerDrawnPath: SVGPathElement;
    public currentSegmentIndex: number = 0;
    public drawnPoints: Vec2[] = [];

    constructor(public pos: Vec2, public main: Main) {
        this.main;
        this.speed = new Vec2(0, 0);
    }

    public initialize(): void {
        let action = () => {
            if (this.drawnPoints.length === 0 || Vec2.DistanceSquared(this.pos, this.drawnPoints[this.drawnPoints.length - 1]) > this.radius * this.radius) {
                this.drawnPoints.push(this.pos.clone());
                this.speed.rotateInPlace(Math.PI * 0.5);
                if (this.mode === PlayerMode.Idle) {
                    this.mode = PlayerMode.Tracing;  
                }
                else {
                    this.mode = PlayerMode.Closing;
                }
            }
        }
        document.body.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "Space") {
                action();
            }
        });

        this.main.container.addEventListener("pointerup", () => {
            action();
        });
    }

    public start(): void {
        this.pos.x = 20;
        this.pos.y = 20;
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
                        this.main.terrain.replace(prev, this.currentSegmentIndex, this.drawnPoints);
                        let surface = Vec2.BBoxSurface(...this.drawnPoints);
                        surface = Math.floor(surface / 100);
                        this.main.setScore(this.main.score + Math.pow(surface, 1.2));
                        this.mode = PlayerMode.Idle;
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

        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "white");
            this.svgElement.setAttribute("stroke-width", "4");
            this.svgElement.setAttribute("fill", playerColor);
            this.main.container.appendChild(this.svgElement);
        }

        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));

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