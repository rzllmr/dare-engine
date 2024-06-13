class Log {
    private static _instance: Log;
    public static instance(): Log {
        if (Log._instance === undefined) {
            Log._instance = new Log();
        }
        return Log._instance;
    }

    private readonly logList: HTMLUListElement;
    private constructor() {
        this.logList = document.querySelector('#log') as HTMLUListElement;
    }

    public tell(line: string): void {
        const listItem: HTMLLIElement = document.createElement('li');
        listItem.textContent = line;
        this.logList.appendChild(listItem);
        this.logList.scrollTop = this.logList.scrollHeight;
    }
}
const log = Log.instance();
export default log;
