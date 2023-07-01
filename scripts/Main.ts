class Main {

    public container: SVGElement;
    public terrain: Terrain;

    constructor() {
        this.terrain = new Terrain(this);
    }

    public initialize(): void {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);

        this.terrain.redraw();
    }
}

window.addEventListener("load", () => {
    let main = new Main();
    main.initialize();
});