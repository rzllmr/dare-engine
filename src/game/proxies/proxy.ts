export class Proxy {
    protected waitForElement(selector: string, callback: (element: HTMLElement) => void): void {
        const parentSelector = selector.replace(/\s*[^\s]+$/, '');
        let parent = parentSelector === '' ? null : document.querySelector(parentSelector);
        if (parent == null) parent = document.body;

        const promise = new Promise<HTMLElement>(resolve => {
            if (document.querySelector(selector) !== null) {
                resolve(document.querySelector(selector) as HTMLElement);
            }
            
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector) !== null) {
                    resolve(document.querySelector(selector) as HTMLElement);
                    observer.disconnect();
                }
            });
            
            observer.observe(parent as HTMLElement, {
                subtree: true,
                childList: true,
            });
        })
        
        promise.then(callback).catch(() => {});
    }
}
