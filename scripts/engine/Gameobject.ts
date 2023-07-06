interface IGameobjectProp {
    name?: string;
    pos?: IVec2;
    rot?: number;
}

class Gameobject {

    public name: string = "";
    public pos: Vec2 = new Vec2();
    public rot: number = 0;
    public renderer: Renderer;

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
        
    }

    public start(): void {

    }

    public update(dt: number): void {

    }

    public stop(): void {
        this.main.gameobjects.remove(this);
    }

    public draw(): void {
        if (this.renderer) {
            this.renderer.draw();
        }
    }

    public updatePosRot(): void {
        if (this.renderer) {
            this.renderer.updatePosRot();
        }
    }
}