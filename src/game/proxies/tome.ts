
class TomeProxy {
    private static _instance: TomeProxy;
    public static instance(): TomeProxy {
        if (TomeProxy._instance === undefined) {
            TomeProxy._instance = new TomeProxy();
        }
        return TomeProxy._instance;
    }

    private readonly tomeNode: HTMLDivElement;
    private readonly ribbon: HTMLDivElement;
    private readonly pageFlip: HTMLDivElement;
    private readonly tabs = new Map<string, HTMLDivElement | null>();
    private readonly markers = new Map<string, HTMLDivElement | null>();
    private activeTab = 'diary';

    private constructor() {
        this.tomeNode = document.querySelector('#tome') as HTMLDivElement;

        this.ribbon = document.querySelector('#ribbon') as HTMLDivElement;

        this.pageFlip = document.querySelector('#page-flip') as HTMLDivElement;
    
        this.tabs.set('diary', this.tomeNode.querySelector('#diary.page'));
        this.tabs.set('info', this.tomeNode.querySelector('#info.page'));
        this.tabs.set('items', this.tomeNode.querySelector('#items.page'));
        this.tabs.set('options', this.tomeNode.querySelector('#options.page'));

        this.markers.set('diary', this.tomeNode.querySelector('#marker-1'));
        this.markers.set('info', this.tomeNode.querySelector('#marker-2'));
        this.markers.set('items', this.tomeNode.querySelector('#marker-3'));
        this.markers.set('options', this.tomeNode.querySelector('#marker-4'));

        this.markers.forEach((value, key) => {
            value?.addEventListener('click', (event) => { this.changeTab(key) });
        });

        // select default page
        this.changeTab(this.activeTab);
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
const tome = TomeProxy.instance();
export default tome;
