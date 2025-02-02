import { dialog } from './dialog';
import { Proxy } from './proxy';

class LogProxy extends Proxy {
    private static _instance: LogProxy;
    public static instance(): LogProxy {
        if (LogProxy._instance === undefined) {
            LogProxy._instance = new LogProxy();
        }
        return LogProxy._instance;
    }

    private logList: HTMLUListElement | null = null;

    private constructor() {
        super();

        this.waitForElement('#book #log', (element) => {
            this.logList = element as HTMLUListElement;
        });
    }
    
    public tell(line: string): void {
        if (this.logList == null) return;

        const listItem: HTMLLIElement = document.createElement('li');
        listItem.textContent = line;
        this.logList.appendChild(listItem);
        this.logList.scrollTop = this.logList.scrollHeight;
        dialog.tell(line);
    }
}
export const log = LogProxy.instance();
