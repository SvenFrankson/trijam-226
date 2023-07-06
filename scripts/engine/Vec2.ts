interface IVec2 {
    x: number;
    y: number;
}

class Vec2 {

    constructor(
        public x: number = 0,
        public y: number = 0
    ) {

    }

    public copyFrom(other: IVec2): Vec2 {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public static DistanceSquared(a: Vec2, b: Vec2): number {
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        return dx * dx + dy * dy;
    }

    public static Distance(a: Vec2, b: Vec2): number {
        return Math.sqrt(Vec2.DistanceSquared(a, b));
    }

    public static Dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y;
    }

    public lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    public length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    public add(other: Vec2): Vec2 {
        return new Vec2(
            this.x + other.x,
            this.y + other.y
        );
    }

    public addInPlace(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    public subtract(other: Vec2): Vec2 {
        return new Vec2(
            this.x - other.x,
            this.y - other.y
        );
    }

    public subtractInPlace(other: Vec2): Vec2 {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    public normalizeInPlace(): Vec2 {
        this.scaleInPlace(1 / this.length());
        return this;
    }

    public scale(s: number): Vec2 {
        return new Vec2(
            this.x * s,
            this.y * s
        );
    }

    public scaleInPlace(s: number): Vec2 {
        this.x *= s;
        this.y *= s;

        return this;
    }

    public rotate(alpha: number): Vec2 {
        return this.clone().rotateInPlace(alpha);
    }
    public rotateInPlace(alpha: number): Vec2 {
        let x = Math.cos(alpha) * this.x - Math.sin(alpha) * this.y;
        let y = Math.cos(alpha) * this.y + Math.sin(alpha) * this.x;
        this.x = x;
        this.y = y;

        return this;
    }

    public static ProjectOnABLine(pt: Vec2, ptA: Vec2, ptB: Vec2): Vec2 {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let tmp = pt.subtract(ptA);
        let dot = Vec2.Dot(dir, tmp);
        let proj = dir.scaleInPlace(dot).addInPlace(ptA);
        return proj;
    }

    public static ProjectOnABSegment(pt: Vec2, ptA: Vec2, ptB: Vec2): Vec2 {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let proj = Vec2.ProjectOnABLine(pt, ptA, ptB);
        let tmpA = pt.subtract(ptA);
        if (Vec2.Dot(tmpA, dir) < 0) {
            return ptA.clone();
        }
        else {
            let invDir = dir.scale(-1);
            let tmpB = pt.subtract(ptB);
            if (Vec2.Dot(tmpB, invDir) < 0) {
                return ptB.clone();
            }
        }
        return proj;
    }

    public static BBoxSurface(...points: Vec2[]): number {
        let min = points.reduce((v1, v2) => { return new Vec2(
            Math.min(v1.x, v2.x),
            Math.min(v1.y, v2.y)
        )});
        let max = points.reduce((v1, v2) => { return new Vec2(
            Math.max(v1.x, v2.x),
            Math.max(v1.y, v2.y)
        )});

        return (max.x - min.x) * (max.y - min.y); 
    }
}