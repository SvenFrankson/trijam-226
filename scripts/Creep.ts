class Creep {

    public speed: Vec2;
    public svgElement: SVGCircleElement;

    constructor(public pos: Vec2, public main: Main) {
        this.main;
        this.speed = new Vec2(
            Math.random() - 0.5,
            Math.random() - 0.5,
        );
        this.speed.normalizeInPlace().scaleInPlace(50);
        console.log(this.speed);
    }

    public update(dt: number): void {
        this.pos.addInPlace(this.speed.scale(dt));
    }

    public redraw(): void {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", "10");
            this.svgElement.setAttribute("stroke", "black");
            this.svgElement.setAttribute("fill", "red");
            this.main.container.appendChild(this.svgElement);
        }

        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));
    }
}