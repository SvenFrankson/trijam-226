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