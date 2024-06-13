class Info {
    private static _instance: Info;
    public static instance(): Info {
        if (Info._instance === undefined) {
            Info._instance = new Info();
        }
        return Info._instance;
    }

    private readonly infoSpan: HTMLSpanElement;
    private constructor() {
        this.infoSpan = document.querySelector('#current-info span') as HTMLSpanElement;
    }

    public tell(line: string): void {
        this.infoSpan.innerHTML = line;
    }
}
const info = Info.instance();
export default info;
