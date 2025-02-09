import { Point } from 'pixi.js';

class TooltipProxy {
    private static _instance: TooltipProxy;
    public static instance(): TooltipProxy {
        if (TooltipProxy._instance === undefined) {
            TooltipProxy._instance = new TooltipProxy();
        }
        return TooltipProxy._instance;
    }

    private readonly tooltipNode: HTMLDivElement;
    private readonly defaultPosition: Point;
    private mousePos: Point;

    private constructor() {
        this.tooltipNode = document.querySelector('#tooltip') as HTMLDivElement;
        this.defaultPosition = new Point(10, 10);
        this.mousePos = new Point();
    }

    private attach(): void {
        const htmlBody = document.querySelector('body') as HTMLBodyElement;
        htmlBody.addEventListener('mousemove', (event: MouseEvent) => {
            this.mousePos = new Point(event.pageX + 12, event.pageY);
            this.position = this.mousePos;
        });
    }

    private set position(position: Point) {
        this.tooltipNode.style.left = String(position.x);
        this.tooltipNode.style.top = String(position.y);
    }

    public tell(line: string, position = this.defaultPosition): void {
        this.tooltipNode.innerHTML = line;
        if (line === '') this.tooltipNode.style.visibility = 'hidden';
        else this.tooltipNode.style.visibility = 'visible';
        this.position = position;
    }

    public text(): string | null {
        return this.tooltipNode.textContent;
    }
}
export const tooltip = TooltipProxy.instance();
