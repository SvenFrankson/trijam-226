class Terrain {

    public path: SVGPathElement;
    public pathCut: SVGPathElement;
    public points: Vec2[] = [];
    public pointsCut: Vec2[] = [];
    public cutSound: HTMLAudioElement;

    constructor(public main: Main) {
        this.points = [
            new Vec2(40, 40),
            new Vec2(960, 40),
            new Vec2(960, 960),
            new Vec2(40, 960),
        ];
        
        this.cutSound = new Audio("sounds/doorClose_000.ogg");
        this.cutSound.volume = 1;
    }

    public replace(start: number, end: number, points: Vec2[]): number {
        if (start === end) {
            this.points.splice(start + 1, 0, ...points.reverse());
            this.pointsCut = [...points];

            this.removePathCut();
            return Vec2.BBoxSurface(...this.pointsCut);
        }
        else {
            if (start < end) {
                let tmp = start;
                start = end;
                end = tmp;
                points = points.reverse();
            }
            
            let inside = this.points.slice(end + 1, start + 1);
            let outside1 = this.points.slice(0, end + 1);
            let outside2 = this.points.slice(start + 1);

            let pointsInside = [...inside, ...points];
            let pointsOutside = [...outside1, ...points.reverse(), ...outside2];

            let inSurface = Vec2.BBoxSurface(...pointsInside);
            let outSurface = Vec2.BBoxSurface(...pointsOutside);

            if (inSurface < outSurface) {
                this.points = pointsOutside;
                this.pointsCut = pointsInside;
            }
            else {
                this.points = pointsInside;
                this.pointsCut = pointsOutside;
            }

            let i = 0;
            while (i < this.points.length) {
                let ptA = this.points[i];
                let ptB = this.points[(i + 1) % this.points.length];
                if (Vec2.DistanceSquared(ptA, ptB) < 1) {
                    this.points.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            
            if (Math.max(inSurface, outSurface) < 960 * 960 * 0.2) {
                this.main.gameover(true);
            }

            this.removePathCut();
            return Vec2.BBoxSurface(...this.pointsCut);
        }
    }

    public redraw(): void {
        if (!this.path) {
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.path);
        }
        if (!this.pathCut) {
            this.pathCut = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.pathCut);
        }

        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            d += "Z";
        }

        this.path.setAttribute("stroke", "white");
        this.path.setAttribute("fill", "#091833");
        this.path.setAttribute("stroke-width", "4");
        this.path.setAttribute("d", d);

        let dCut = "";
        if (this.pointsCut.length > 0) {
            dCut = "M" + this.pointsCut[0].x + " " + this.pointsCut[0].y + " ";
            for (let i = 1; i < this.pointsCut.length; i++) {
                dCut += "L" + this.pointsCut[i].x + " " + this.pointsCut[i].y + " ";
            }
            dCut += "Z";
        }

        this.pathCut.setAttribute("stroke", "white");
        this.pathCut.setAttribute("fill", playerColor);
        this.pathCut.setAttribute("stroke-width", "4");
        this.pathCut.setAttribute("d", dCut);
    }

    private _timout: number;
    public removePathCut(): void {
        clearTimeout(this._timout);
        this._timout = setTimeout(() => {
            this.pointsCut = [];
            this.cutSound.currentTime = 0;
            this.cutSound.play();
        }, 1000);
    }
}