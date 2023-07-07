interface ISoundProp {
    fileName?: string;
    loop?: boolean;
}

class Sound extends Component {

    private _audioElement: HTMLAudioElement;

    constructor(gameobject: Gameobject, prop: ISoundProp) {
        super(gameobject);
        if (prop) {
            if (prop.fileName) {
                this._audioElement = new Audio("sounds/" + prop.fileName);
            }
            if (this._audioElement) {
                if (prop.loop) {
                    this._audioElement.loop = prop.loop;
                }
            }
        }
    }

    public play(fromBegin: boolean = true): void {
        if (this._audioElement) {
            if (fromBegin) {
                this._audioElement.currentTime = 0;
            }
            this._audioElement.play();
        }
    }

    public pause(): void {
        if (this._audioElement) {
            this._audioElement.pause();
        }
    }

    public onPause(): void {
        this.pause();
    }

    public onStop(): void {
        this.pause();
    }
}