class Player {

    public speed: Vec2;
    public radius: number = 15;
    public svgElement: SVGCircleElement;

    constructor(public pos: Vec2, public main: Main) {
        this.main;
        this.speed = new Vec2(
            Math.random() - 0.5,
            Math.random() - 0.5,
        );
        this.speed.normalizeInPlace().scaleInPlace(0);
    }

    public update(dt: number): void {
        let dp = this.speed.scale(dt);
        this.pos.addInPlace(dp);
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