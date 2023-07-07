interface IGameobjectProp {
    name?: string;
    pos?: IVec2;
    rot?: number;
}

class Gameobject {

    public name: string = "";
    public pos: Vec2 = new Vec2();
    public rot: number = 0;
    protected renderers: UniqueList<Renderer> = new UniqueList<Renderer>();
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
        this.components.forEach(component => {
            component.dispose();
        })
    }

    public addComponent(component: Component): Component {
        if (component instanceof Renderer) {
            this.renderers.push(component);
        }
        this.components.push(component);
        return component;
    }

    public start(): void {

    }

    public update(dt: number): void {

    }

    public stop(): void {
        this.components.forEach(component => {
            component.onStop();
        })
    }

    public draw(): void {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.draw();
            });
        }
    }

    public updatePosRot(): void {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.updatePosRot();
            });
        }
    }
}