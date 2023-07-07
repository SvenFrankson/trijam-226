/// <reference path="engine/Gameobject.ts" />

class Creep extends Gameobject {

    public speed: Vec2;
    public radius: number = 15;

    public testCreep: Creep;

    constructor(pos, main: Main) {
        super({
                pos: pos
            },
            main
        );
        this.main;
        this.speed = new Vec2(
            Math.random() - 0.5,
            Math.random() - 0.5,
        );
        let s = Math.random() * 100 + 50;
        this.speed.normalizeInPlace().scaleInPlace(s);
        
        let f = 1 - s / 150;

        this.radius = 10 + f * 10;        
        this.renderer = new CircleRenderer(this, { radius: this.radius });
    }

    public update(dt: number): void {
        let flipX: boolean = false;
        let flipY: boolean = false;
        let dp = this.speed.scale(dt);
        this.pos.addInPlace(dp);
        let points = this.main.terrain.points
        for (let i = 0; i < points.length; i++) {
            let ptA = points[i];
            let ptB = points[(i + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            
            if (sqrDist < this.radius * this.radius) {
                var audio = new Audio("sounds/impactMetal_000.ogg");
                audio.play();
                let n = ptB.subtract(ptA).rotateInPlace(Math.PI / 2);
                if (Math.abs(n.x) > Math.abs(n.y)) {
                    flipX = true;
                }
                else {
                    flipY = true;
                }
            }
        }

        if (flipX || flipY) {
            if (flipX) {
                this.speed.x *= -1;
            }
            if (flipY) {
                this.speed.y *= -1;
            }
            this.speed.rotateInPlace(Math.random() * Math.PI * 0.2 - Math.PI * 0.1);
            this.pos.subtractInPlace(dp.scale(1));
        }

        points = [...this.main.player.drawnPoints, this.main.player.pos];
        for (let i = 0; i < points.length - 1; i++) {
            let ptA = points[i];
            let ptB = points[i + 1];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            
            if (sqrDist < this.radius * this.radius) {
                this.main.gameover();
            }
        }
    }
}