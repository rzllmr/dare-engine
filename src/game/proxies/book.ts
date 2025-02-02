import { env } from "engine/environment";
import { Page } from "./page";

class BookProxy {
    private static _instance: BookProxy;
    public static instance(): BookProxy {
        if (BookProxy._instance === undefined) {
            BookProxy._instance = new BookProxy();
        }
        return BookProxy._instance;
    }

    private readonly bookNode: HTMLDivElement;
    private readonly ribbon: HTMLDivElement;
    private readonly pageFlip: HTMLDivElement;
    private readonly tabs = new Map<string, HTMLDivElement | null>();
    private readonly markers = new Map<string, HTMLDivElement | null>();
    private activeTab = 'diary';
    private _visible = false;

    private constructor() {
        this.bookNode = document.querySelector('#book') as HTMLDivElement;

        this.ribbon = document.querySelector('#ribbon') as HTMLDivElement;

        this.pageFlip = document.querySelector('#page-flip') as HTMLDivElement;
    
        this.tabs.set('diary', this.bookNode.querySelector('#diary.page'));
        this.tabs.set('info', this.bookNode.querySelector('#info.page'));
        this.tabs.set('items', this.bookNode.querySelector('#items.page'));
        this.tabs.set('options', this.bookNode.querySelector('#options.page'));

        this.markers.set('diary', this.bookNode.querySelector('#marker-1'));
        this.markers.set('info', this.bookNode.querySelector('#marker-2'));
        this.markers.set('items', this.bookNode.querySelector('#marker-3'));
        this.markers.set('options', this.bookNode.querySelector('#marker-4'));

        this.markers.forEach((value, key) => {
            const eventType = env.mobile ? 'touchstart' : 'click';
            value?.addEventListener(eventType, (event) => { this.changeTab(key) });
        });

        // select default page
        this.changeTab(this.activeTab);
    }

    public async load(): Promise<void> {
        this.tabs.forEach((node, tab) => {
            if (node == null) return;

            node.innerHTML = (new Page(tab)).html;
        });
    }

    public show(show = true): void {
        this.bookNode.style.visibility = show ? 'visible' : 'hidden';
        this._visible = show;
    }

    public get visible(): boolean {
        return this._visible;
    }

    public get element(): HTMLDivElement {
        return this.bookNode;
    }

    private flip(direction = 0, idx = -2): void {
        if (direction === 0) return;

        if (idx === -2) idx = direction > 0 ? 1 : 5;
        this.pageFlip.className = `flip${idx}`;
        idx += direction > 0 ? 1 : -1;
        if (idx > -1 && idx < 6) {
            setTimeout(() => { this.flip(direction, idx) }, 32);
        }
    }

    public changeTab(tabName: string): void {
        const tabNames = Array.from(this.tabs.keys());

        if (['Left', 'Right'].includes(tabName)) {
            let idx = tabNames.indexOf(this.activeTab);
            idx += tabName === 'Right' ? 1 : -1;
            idx = Math.min(Math.max(idx, 0), tabNames.length - 1);
            tabName = tabNames.at(idx) as string;
        }

        if (!this.tabs.has(tabName)) return;
        
        const direction = tabNames.indexOf(tabName) - tabNames.indexOf(this.activeTab);

        this.tabs.get(this.activeTab)?.style.setProperty('display', 'none');
        this.markers.get(this.activeTab)?.classList.remove('selected');
        this.ribbon.classList.remove(`${this.activeTab}-ribbon`);

        this.activeTab = tabName;

        this.tabs.get(this.activeTab)?.style.setProperty('display', 'block');
        this.markers.get(this.activeTab)?.classList.add('selected');
        this.ribbon.classList.add(`${this.activeTab}-ribbon`);

        this.flip(direction);
    }

}
export const book = BookProxy.instance();
