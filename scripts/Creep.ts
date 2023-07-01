class Creep {

    public speed: Vec2;
    public radius: number = 10;
    public svgElement: SVGCircleElement;

    public testCreep: Creep;

    constructor(public pos: Vec2, public main: Main) {
        this.main;
        this.speed = new Vec2(
            Math.random() - 0.5,
            Math.random() - 0.5,
        );
        this.speed.normalizeInPlace().scaleInPlace(200);
    }

    public update(dt: number): void {
        let dp = this.speed.scale(dt);
        this.pos.addInPlace(dp);
        let points = this.main.terrain.points
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
    }

    public redraw(): void {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "black");
            this.svgElement.setAttribute("fill", "red");
            this.main.container.appendChild(this.svgElement);
        }

        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));
    }
}