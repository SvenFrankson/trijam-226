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

    public replace(start: number, end: number, points: Vec2[]): void {
        if (start === end) {
            this.points.splice(start + 1, 0, ...points.reverse());
        }
        else if (end < start) {
            this.points.splice(end + 1, start - end, ...points.reverse());
        }
        else if (start < end) {
            this.points = this.points.slice(start + 1);
            this.points = this.points.splice(0, end - start);
            this.points.push(...points.reverse());
        }
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

        this.path.setAttribute("stroke", "#343434");
        this.path.setAttribute("fill", "#B5B682");
        this.path.setAttribute("stroke-width", "4");
        this.path.setAttribute("d", d);
    }
}