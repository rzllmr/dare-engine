// TypeScript implementation of the A* path finding algorithm

import { Point } from 'pixi.js';

export default function computePath(
    start: Point,
    end: Point,
    isBlocking: (tile: Point) => boolean,
): Point[] {
    const startNode = new Node(start);
    const endNode = new Node(end);

    const openList: Node[] = [];
    const closedList: Node[] = [];

    openList.push(startNode);

    while (openList.length > 0) {
        let currentNode = openList[0];
        let currentIdx = 0;
        openList.forEach((item, idx) => {
            if (item.f < currentNode.f) {
                currentNode = item;
                currentIdx = idx;
            }
        });

        openList.splice(currentIdx, 1);
        closedList.push(currentNode);

        if (currentNode === endNode) {
            const path: Point[] = [];
            let current: Node | undefined = currentNode;
            while (current !== undefined) {
                path.push(current.position);
                current = current.parent;
            }
            return path.reverse();
        }

        const children: Node[] = [];
        const neighbors: Point[] = [new Point(0, -1), new Point(0, 1), new Point(-1, 0), new Point(1, 0)];
        for (const newPosition of neighbors) {
            const nodePosition = new Point(currentNode.position.x + newPosition.x, currentNode.position.y + newPosition.y);
            if (isBlocking(nodePosition)) continue;

            children.push(new Node(nodePosition, currentNode));
        }

        for (const child of children) {
            if (closedList.find((closedChild) => { return child.equals(closedChild); }) !== undefined) continue;

            child.g = currentNode.g + 1;
            child.h = ((child.position.x - endNode.position.x) ** 2) + ((child.position.y - endNode.position.y) ** 2);
            child.f = child.g + child.h;

            if (closedList.find((openChild) => { return child.equals(openChild) && child.g > openChild.g; }) !== undefined) continue;

            openList.push(child);
        }
    }

    return [];
}

class Node {
    public parent: Node | undefined;
    public position: Point;
    public g = 0;
    public h = 0;
    public f = 0;

    constructor(position: Point, parent?: Node) {
        this.position = position;
        this.parent = parent;
    }

    public equals(other: Node): boolean {
        return this.position.x === other.position.x && this.position.y === other.position.y;
    }
}
