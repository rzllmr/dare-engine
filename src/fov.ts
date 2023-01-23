// TypeScript implementation of the algorithm developed by Albert Ford
// licensed under Creative Commons Zero v1.0 Universal
// hosted at https://github.com/370417/symmetric-shadowcasting.git
// explained at https://www.albertford.com/shadowcasting/
//
// It satisfies six desirable properties for field of view algorithms in rogue-likes
// defined by Adam Milazzo at http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html:
// symmetry, expansive walls, expanding pillar shadows, no blind corners, no artifacts, efficiency

import { Point } from "pixi.js";

export default function computeFov(origin: Point, isBlocking: (tile: Point) => boolean, markVisible: (tile: Point) => void): void {

    markVisible(origin)

    for (let i = 0; i < 4; i++) {
        const quadrant = new Quadrant(i, origin)

        function reveal(tile: Point): void {
            const transform = quadrant.transform(tile)
            markVisible(transform)
        }

        function isWall(tile: Point|null): boolean {
            if (tile === null) return false;
            const transform = quadrant.transform(tile)
            return isBlocking(transform)
        }

        function isFloor(tile: Point|null): boolean {
            if (tile === null) return false;
            const transform = quadrant.transform(tile)
            return !isBlocking(transform)
        }

        function scan(row: Row): void {
            let prevTile = null;
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
                    scan(nextRow);
                }
                prevTile = tile;
            }
            if (isFloor(prevTile)) {
                scan(row.next())
            }
        }

        const firstRow = new Row(1, new Fraction(-1), new Fraction(1))
        scan(firstRow)
    }
}

class Quadrant {
    private readonly direction = {north: 0, east: 1, south: 2, west: 3};
    private readonly cardinal: number;
    private readonly origin: Point;

    constructor(cardinal: number, origin: Point) {
        this.cardinal = cardinal
        this.origin = origin
    }

    public transform(tile: Point): Point {
        if (this.cardinal === this.direction.north)
            return new Point(this.origin.x + tile.y, this.origin.y - tile.x)
        else if (this.cardinal === this.direction.south)
            return new Point(this.origin.x + tile.y, this.origin.y + tile.x)
        else if (this.cardinal === this.direction.east)
            return new Point(this.origin.x + tile.x, this.origin.y + tile.y)
        else if (this.cardinal === this.direction.west)
            return new Point(this.origin.x - tile.x, this.origin.y + tile.y)
        else throw new Error(`not a cardinal direction: ${this.cardinal}`);
    }
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

    public* tiles(): Generator<Point> {
        const minCol = roundTiesUp(this.startSlope.multiply(this.depth));
        const maxCol = roundTiesDown(this.endSlope.multiply(this.depth));
        for (let col = minCol; col <= maxCol; col++) {
            yield new Point(this.depth, col);
        }
    }

    public next(): Row {
        return new Row(this.depth + 1, this.startSlope, this.endSlope);
    }
}

function slope(tile: Point): Fraction {
    return new Fraction(2 * tile.y - 1, 2 * tile.x);
}

function isSymmetric(row: Row, tile: Point): boolean {
    return (tile.y >= row.startSlope.multiply(row.depth)
         && tile.y <= row.endSlope.multiply(row.depth))
}

function roundTiesUp(n: number): number {
    return Math.floor(n + 0.5);
}

function roundTiesDown(n: number): number {
    return Math.ceil(n - 0.5);
}

class Fraction {
    private readonly numerator: number;
    private readonly denominator: number;

    constructor(numerator: number, denominator: number = 1) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    public get decim(): number {
        return this.numerator / this.denominator;
    }

    // avoids floating point inaccuracies 
    public multiply(multiplier: number): number {
        return multiplier * this.numerator / this.denominator;
    }
}
