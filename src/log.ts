class Log {
    private static _instance: Log;
    public static instance(): Log {
        if (Log._instance === undefined) {
            Log._instance = new Log();
        }
        return Log._instance;
    }

    private constructor() {}

    public log(line: string): void {
        const logDiv = document.querySelector('#log') as HTMLDivElement;

        const newParagraph: HTMLSpanElement = document.createElement('span');
        newParagraph.textContent = line;
        logDiv.appendChild(newParagraph);
    }
}
const log = Log.instance();
export default log;
