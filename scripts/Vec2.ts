class Vec2 {

    constructor(
        public x: number = 0,
        public y: number = 0
    ) {

    }

    public lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    public length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    public addInPlace(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
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
}