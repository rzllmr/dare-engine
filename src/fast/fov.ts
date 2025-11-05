// TypeScript implementation of the algorithm developed by Albert Ford
// licensed under Creative Commons Zero v1.0 Universal
// hosted at https://github.com/370417/symmetric-shadowcasting.git
// explained at https://www.albertford.com/shadowcasting/
//
// It satisfies six desirable properties for field of view algorithms in rogue-likes
// defined by Adam Milazzo at http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html:
// symmetry, expansive walls, expanding pillar shadows, no blind corners, no artifacts, efficiency

import { Point } from 'pixi.js';
import { compute_fov, point_struct } from 'fast/wasm/pkg/fast_functions';

export { computeFov_Native as computeFov };

function computeFov_Wasm(origin: Point, blocking: boolean[], boundaries: Point, maxDistance: number): number[] {
    const visible = compute_fov(
        point_struct(origin.x, origin.y),
        Uint8Array.from(blocking),
        point_struct(boundaries.x, boundaries.y),
        maxDistance
    );
    return Array.from(visible);
}

function computeFov_Native(
    origin: Point,
    blocking: boolean[],
    boundaries: Point,
    maxDistance: number = Infinity
): number[] {
    const toIdx = (coord: Point): number => {
        return coord.x + coord.y * boundaries.x;
    }

    const visibles = Array(blocking.length).fill(0.0);
    visibles[toIdx(origin)] = 1.0;

    for (const transform of quadrants(origin)) {
        const inside = (coord: Point): boolean => {
            coord = transform(coord);
            return insideBoundaries(coord, boundaries) && insideCircle(coord, origin, maxDistance);
        }
        const isWall = (coord?: Point): boolean => {
            if (coord == undefined) return false;
            if (!inside(coord)) return true;
            return blocking[toIdx(transform(coord))];
        }
        const isFloor = (coord?: Point): boolean => {
            if (coord == undefined) return false;
            if (!inside(coord)) return false;
            return !blocking[toIdx(transform(coord))];
        }
        const reveal = (coord: Point): void => {
            coord = transform(coord);
            if (insideBoundaries(coord, boundaries) && insideCircle(coord, origin, maxDistance)) {
                visibles[toIdx(coord)] = distance(coord, origin, maxDistance);
            }
        }

        const firstRow = new Row(1, new Fraction(-1), new Fraction(1));
        const rows = [firstRow];
        while (rows.length > 0) {
            const row = rows.pop() as Row;
            let prevTile = undefined;
            for (const tile of row.tiles()) {
                if (isWall(tile) || isSymmetric(row, tile)) {
                    reveal(tile);
                }
                if (isWall(prevTile) && isFloor(tile)) {
                    row.startSlope = slope(tile);
                }
                if (isFloor(prevTile) && isWall(tile)) {
                    const nextRow = row.next();
                    nextRow.endSlope = slope(tile);
                    rows.push(nextRow);
                }
                prevTile = tile;
            }
            if (isFloor(prevTile)) {
                rows.push(row.next());
            }
        }
    }

    return visibles;
}

class Row {
    public depth: number;
    public startSlope: Fraction;
    public endSlope: Fraction;

    constructor(depth: number, startSlope: Fraction, endSlope: Fraction) {
        this.depth = depth;
        this.startSlope = startSlope;
        this.endSlope = endSlope;
    }

    public tiles(): Point[] {
        const minCol = roundTiesUp(this.startSlope.multiply(this.depth));
        const maxCol = roundTiesDown(this.endSlope.multiply(this.depth));
        const tiles = new Array(maxCol + 1 - minCol);
        for (let i = 0; i < tiles.length; i++) {
            tiles[i] = new Point(this.depth, i + minCol);
        }
        return tiles;
    }

    public next(): Row {
        return new Row(this.depth + 1, this.startSlope, this.endSlope);
    }
}

class Fraction {
    private readonly numerator: number;
    private readonly denominator: number;

    constructor(numerator: number, denominator: number = 1) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    // avoids floating point inaccuracies
    public multiply(multiplier: number): number {
        return (multiplier * this.numerator) / this.denominator;
    }
}

function quadrants(origin: Point): ((coord: Point) => Point)[] {
    return [
        (tile: Point): Point => new Point(origin.x + tile.y, origin.y - tile.x), // north
        (tile: Point): Point => new Point(origin.x + tile.y, origin.y + tile.x), // south
        (tile: Point): Point => new Point(origin.x + tile.x, origin.y + tile.y), // east 
        (tile: Point): Point => new Point(origin.x - tile.x, origin.y + tile.y)  // west
    ];
}

function slope(tile: Point): Fraction {
    return new Fraction(2 * tile.y - 1, 2 * tile.x);
}

function isSymmetric(row: Row, tile: Point): boolean {
    return tile.y >= row.startSlope.multiply(row.depth) && tile.y <= row.endSlope.multiply(row.depth);
}

function roundTiesUp(n: number): number {
    return Math.floor(n + 0.5);
}

function roundTiesDown(n: number): number {
    return Math.ceil(n - 0.5);
}

function insideBoundaries(coord: Point, boundaries: Point): boolean {
    return coord.x >= 0 && coord.y >= 0 && coord.x <= boundaries.x && coord.y <= boundaries.y;
}

function insideCircle(coord: Point, origin: Point, radius: number): boolean {
    if (radius == Infinity) return true;
    return Math.pow(coord.x - origin.x, 2) + Math.pow(coord.y - origin.y, 2) <= Math.pow(radius + 0.9, 2);
}

function distance(coord: Point, origin: Point, radius: number): number {
    const distance = (Math.pow(coord.x - origin.x, 2) + Math.pow(coord.y - origin.y, 2)) / Math.pow(radius + 0.9, 2);
    return Math.pow(1.0 - distance, 1);
}
