// TypeScript implementation of an iterative queue flood fill algorithm
// explained at https://codeheir.com/2022/08/21/comparing-flood-fill-algorithms-in-javascript/

import { Point } from 'pixi.js';

export default function unveilRoom(
    origin: Point,
    isBlocking: (tile: Point) => boolean,
    markVisible: (tile: Point) => void,
    isVisible: (tile:Point) => boolean,
    maxDistance: number = Infinity
): void {
    // using queue fill for expansion from origin
    const queue = [origin];

    while (queue.length > 0) {
        const current = queue.shift() as Point;
        for (const direction of directions()) {
            const child = new Point(
                current.x + direction.x,
                current.y + direction.y
            );
            if (!isVisible(child) && insideCircle(child, origin, maxDistance)) {
                markVisible(child);
                if (!isBlocking(child)) queue.push(child);
            }
        }
    }
}

function insideCircle(tile: Point, origin: Point, radius: number): boolean {
    if (radius == Infinity) return true;
    return Math.pow(tile.x - origin.x, 2) + Math.pow(tile.y - origin.y, 2) <= Math.pow(radius + 0.5, 2);
}

function directions(): Point[] {
    return [
        new Point(0, 1),  // north
        new Point(1, 1),  // north-east
        new Point(1, 0),  // east
        new Point(1, -1),  // south-east
        new Point(0, -1), // south
        new Point(-1, -1), // south-west
        new Point(-1, 0),  // west
        new Point(-1, 1)  // north-west
    ];
}
