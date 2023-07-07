/// <reference path="Component.ts" />

interface IRendererProp {
    layer?: number;
    classList?: string[];
}

abstract class Renderer extends Component {

    public layer: number = 0;

    protected _classList: UniqueList<string> = new UniqueList<string>();
    public addClass(c: string): void {
        this._classList.push(c);
        this.onClassAdded(c);
    }
    public removeClass(c: string): void {
        this._classList.remove(c);
        this.onClassRemoved(c);
    }
    protected abstract onClassAdded(c: string): void;
    protected abstract onClassRemoved(c: string): void;

    constructor(gameobject: Gameobject, prop?: IRendererProp) {
        super(gameobject);
        if (prop) {
            if (isFinite(prop.layer)) {
                this.layer = prop.layer;
            }
            if (prop.classList) {
                prop.classList.forEach(c => {
                    this.addClass(c);
                })
            }
        }
    }
    public draw(): void {

    }

    public updatePosRot(): void {

    }
}

interface ICircleRendererProp extends IRendererProp {
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

    protected onClassAdded(c: string): void {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    protected onClassRemoved(c: string): void{
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }

    constructor(gameobject: Gameobject, prop?: ICircleRendererProp) {
        super(gameobject, prop);
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
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
    }

    public updatePosRot(): void {
        this.svgElement.setAttribute("cx", this.gameobject.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.gameobject.pos.y.toFixed(1));
    }

    public dispose(): void {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}

interface IPathRendererProp extends IRendererProp {
    points?: IVec2[];
    d?: string;
    close?: boolean
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

    private _close: boolean = false;
    public get close(): boolean {
        return this._close;
    }
    public set close(v: boolean) {
        this._close = v;
        this.draw();
    }

    protected onClassAdded(c: string): void {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    protected onClassRemoved(c: string): void{
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }

    constructor(gameobject: Gameobject, prop?: IPathRendererProp) {
        super(gameobject, prop);
        if (prop) {
            if (prop.points instanceof Array) {
                this.points = prop.points;
            }
            if (prop.d) {
                this.d = prop.d;
            }
            if (prop.close) {
                this.close = prop.close;
            }
        }
    }

    public draw(): void {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
        
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            if (this.close) {
                d += "Z";
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
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}