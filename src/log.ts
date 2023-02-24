class Log {
    private static _instance: Log;
    public static instance(): Log {
        if (Log._instance === undefined) {
            Log._instance = new Log();
        }
        return Log._instance;
    }

    private readonly logDiv: HTMLDivElement;
    private constructor() {
        this.logDiv = document.querySelector('#log') as HTMLDivElement;
    }

    public tell(line: string): void {
        const newParagraph: HTMLSpanElement = document.createElement('span');
        newParagraph.textContent = line;
        this.logDiv.appendChild(newParagraph);
    }
}
const log = Log.instance();
export default log;
