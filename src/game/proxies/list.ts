export class ListProxy {
    private readonly listNode: HTMLUListElement;
    private readonly list: Map<string, HTMLLIElement>;
    private readonly max: number;

    constructor(selector: string, max = Infinity) {
        this.listNode = document.querySelector(selector) as HTMLUListElement;
        this.list = new Map<string, HTMLLIElement>();
        this.max = max;
        this.init();
    }

    public init(): void {
        this.list.clear();
        for (const child of this.listNode.children) {
            this.list.set(child.textContent ?? '', child as HTMLLIElement);
        }
    }

    public add(name: string): void {
        const listItem: HTMLLIElement = document.createElement('li');
        listItem.textContent = name;
        this.list.set(name, listItem);
        this.listNode.appendChild(listItem);
        if (this.list.size === 2) this.remove('none');
    }

    public remove(name: string): void {
        const listItem = this.list.get(name);
        if (listItem !== undefined) {
            this.listNode.removeChild(listItem);
            this.list.delete(name);
            if (this.list.size === 0) this.add('none');
        }
    }
}
