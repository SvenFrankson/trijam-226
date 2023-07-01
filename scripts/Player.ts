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
    public currentSegmentIndex: number = 0;
    public drawnPoints: Vec2[];

    constructor(public pos: Vec2, public main: Main) {
        this.main;
        this.speed = new Vec2(0, 0);
    }

    public start(): void {
        document.body.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "Space") {
                this.speed.rotateInPlace(Math.PI * 0.5);
                if (this.mode === PlayerMode.Idle) {
                    this.mode = PlayerMode.Tracing;  
                }
                else {
                    this.mode = PlayerMode.Closing;
                }
            }
        })
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

            let points = this.main.terrain.points
            for (let i = 0; i < points.length; i++) {
                if (this.mode === PlayerMode.Closing || i != this.currentSegmentIndex) {
                    let ptA = points[i];
                    let ptB = points[(i + 1) % points.length];
                    let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
                    
                    let sqrDist = this.pos.subtract(proj).lengthSquared();
                    
                    if (sqrDist < 1) {
                        this.currentSegmentIndex = i;
                        this.mode = PlayerMode.Idle;
                    }
                }
            }
        }
    }

    public redraw(): void {
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
    }
}