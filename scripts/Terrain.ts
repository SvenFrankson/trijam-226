class Terrain {

    public path: SVGPathElement;
    public points: Vec2[] = [];

    constructor(public main: Main) {
        this.points = [
            new Vec2(20, 20),
            new Vec2(980, 20),
            new Vec2(980, 980),
            new Vec2(20, 980),
        ];
    }

    public redraw(): void {
        if (!this.path) {
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.path);
        }

        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            d += "Z";
        }

        this.path.setAttribute("stroke", "black");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke-width", "5");
        this.path.setAttribute("d", d);
    }
}