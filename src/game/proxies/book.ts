import env from "../../environment";
import { Assets } from "pixi.js";

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

    public load(): void {
        this.tabs.forEach((node, tab) => {
            if (node == null) return;

            let html = Assets.get(`template.${tab}`);
            html = html.replace('{tab}', tab);
            node.innerHTML = html;
        });
    }

    public get element(): HTMLDivElement {
        return this.bookNode;
    }

    private flip(idx = 1): void {
        this.pageFlip.className = `flip${idx}`;
        idx += 1;
        if (idx < 6) setTimeout(() => this.flip, 16 * idx, idx);
    }

    public changeTab(tabName: string): void {
        if (['Left', 'Right'].includes(tabName)) {
            const tabNames = Array.from(this.tabs.keys());
            let idx = tabNames.indexOf(this.activeTab);
            idx += tabName === 'Right' ? 1 : -1;
            idx = Math.min(Math.max(idx, 0), tabNames.length - 1);
            tabName = tabNames.at(idx) as string;
        }

        if (!this.tabs.has(tabName)) return;
        
        this.tabs.get(this.activeTab)?.style.setProperty('display', 'none');
        this.markers.get(this.activeTab)?.classList.remove('selected');
        this.ribbon.classList.remove(`${this.activeTab}-ribbon`);

        this.activeTab = tabName;

        this.tabs.get(this.activeTab)?.style.setProperty('display', 'block');
        this.markers.get(this.activeTab)?.classList.add('selected');
        this.ribbon.classList.add(`${this.activeTab}-ribbon`);

        // this.flip();
    }

}
const book = BookProxy.instance();
export default book;
