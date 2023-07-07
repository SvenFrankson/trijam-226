/// <reference path="Component.ts" />

class Renderer extends Component {

    public draw(): void {

    }

    public updatePosRot(): void {

    }
}

interface ICircleRendererProp {
    radius?: number;
}

class CircleRenderer extends Renderer {
    public svgElement: SVGCircleElement;

    private _radius: number = 10;
    public get radius(): number {
        return this._radius;
    }
    public set radius(v: number) {
        this._radius = v;
        if (this.svgElement) {
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
        }
    }

    constructor(gameobject: Gameobject, prop?: ICircleRendererProp) {
        super(gameobject);
        if (prop) {
            if (isFinite(prop.radius)) {
                this.radius = prop.radius;
            }
        }
    }

    public draw(): void {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "white");
            this.svgElement.setAttribute("stroke-width", "4");
            this.svgElement.setAttribute("fill", creepColor);
            this.gameobject.main.container.appendChild(this.svgElement);
        }
    }

    public updatePosRot(): void {
        this.svgElement.setAttribute("cx", this.gameobject.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.gameobject.pos.y.toFixed(1));
    }

    public dispose(): void {
        if (this.svgElement) {
            this.gameobject.main.container.removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}

interface IPathRendererProp {
    points?: IVec2[];
    d?: string;
}

class PathRenderer extends Renderer {
    public svgElement: SVGPathElement;

    private _points: IVec2[] = [];
    public get points(): IVec2[] {
        return this._points;
    }
    public set points(v: IVec2[]) {
        this._points = v;
        this.draw();
    }

    private _d: string = "";
    public get d(): string {
        return this._d;
    }
    public set d(s: string) {
        this._d = s;
        this.draw();
    }

    constructor(gameobject: Gameobject, prop?: IPathRendererProp) {
        super(gameobject);
        if (prop) {
            if (prop.points instanceof Array) {
                this.points = prop.points;
            }
            if (prop.d) {
                this.d = prop.d;
            }
        }
    }

    public draw(): void {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.svgElement.setAttribute("stroke", "white");
            this.svgElement.setAttribute("stroke-width", "4");
            this.svgElement.setAttribute("stroke-linejoin", "round");
            this.svgElement.setAttribute("fill", playerColor);
            this.gameobject.main.container.appendChild(this.svgElement);
        }
        
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
        }
        else {
            d = this.d;
        }
        this.svgElement.setAttribute("d", d);
    }

    public updatePosRot(): void {
        this.svgElement.setAttribute("transform", "translate(" + this.gameobject.pos.x.toFixed(1) + " " + this.gameobject.pos.y.toFixed(1) + "), rotate(" + (this.gameobject.rot / Math.PI * 180).toFixed(0) + ")");
    }

    public dispose(): void {
        if (this.svgElement) {
            this.gameobject.main.container.removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}