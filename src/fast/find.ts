// TypeScript implementation of an iterative queue flood fill algorithm
// explained at https://codeheir.com/2022/08/21/comparing-flood-fill-algorithms-in-javascript/

import { Point } from 'pixi.js';
import { find_next, point_struct } from 'fast/wasm/pkg/fast_functions';

export { findNext_Native as findNext };

function findNext_Wasm(origin: Point, ground: boolean[], boundaries: Point, maxDistance: number): number {
    const index = find_next(
        point_struct(origin.x, origin.y),
        Uint8Array.from(ground),
        point_struct(boundaries.x, boundaries.y),
        maxDistance
    );
    return index;
}

function findNext_Native(
    origin: Point,
    ground: boolean[],
    boundaries: Point,
    maxDistance: number = Infinity
): number {
    // using queue fill for expansion from origin
    const visited = Array(ground.length).fill(false);

    const queue = [origin];
    while (queue.length > 0) {
        const current = queue.shift() as Point;
        for (const direction of directions()) {
            const child = addPoints(current, direction);
            const index = child.x + child.y * boundaries.x;

            if (visited[index]) continue;
            visited[index] = true;

            if (!insideBoundaries(child, boundaries)) continue;
            if (!insideCircle(child, origin, maxDistance)) continue;

            if (ground[index]) return index;

            queue.push(child);
        }
    }

    return 0;
}

function addPoints(a: Point, b: Point): Point {
    return new Point(a.x + b.x, a.y + b.y);
}

function insideBoundaries(coord: Point, boundaries: Point): boolean {
    return coord.x <= boundaries.x && coord.y <= boundaries.y;
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
