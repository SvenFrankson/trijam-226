interface IGameobjectProp {
    name?: string;
    pos?: IVec2;
    rot?: number;
}

class Gameobject {

    public name: string = "";
    public pos: Vec2 = new Vec2();
    public rot: number = 0;
    private _renderer: Renderer;
    public components: UniqueList<Component> = new UniqueList<Component>();

    constructor(prop?: IGameobjectProp, public main?: Main) {
        if (prop) {
            if (prop.name) {
                this.name = prop.name;
            }
            if (prop.pos) {
                this.pos.copyFrom(prop.pos);
            }
            if (isFinite(prop.rot)) {
                this.rot = prop.rot;
            }
        }
    }

    public instantiate(): void {
        this.main.gameobjects.push(this);
    }

    public dispose(): void {
        this.main.gameobjects.remove(this);
    }

    public addComponent(component: Component): Component {
        if (component instanceof Renderer) {
            this._renderer = component;
        }
        this.components.push(component);
        return component;
    }

    public start(): void {

    }

    public update(dt: number): void {

    }

    public stop(): void {

    }

    public draw(): void {
        if (this._renderer) {
            this._renderer.draw();
        }
    }

    public updatePosRot(): void {
        if (this._renderer) {
            this._renderer.updatePosRot();
        }
    }
}