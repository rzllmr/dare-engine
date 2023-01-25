// TypeScript implementation of the algorithm developed by Albert Ford
// licensed under Creative Commons Zero v1.0 Universal
// hosted at https://github.com/370417/symmetric-shadowcasting.git
// explained at https://www.albertford.com/shadowcasting/
//
// It satisfies six desirable properties for field of view algorithms in rogue-likes
// defined by Adam Milazzo at http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html:
// symmetry, expansive walls, expanding pillar shadows, no blind corners, no artifacts, efficiency

import { Point } from "pixi.js";

export default function computeFov(origin: Point, isBlocking: (tile: Point) => boolean, markVisible: (tile: Point) => void, maxDistance: number = Infinity): void {

    markVisible(origin)

    for (const transform of quadrantTransforms(origin)) {
    
        function reveal(tile: Point): void {
            const transformed = transform(tile)
            if (insideCircle(transformed, origin, maxDistance))
                markVisible(transformed)
        }

        function isWall(tile: Point|null): boolean {
            if (tile === null) return false;
            return isBlocking(transform(tile))
        }

        function isFloor(tile: Point|null): boolean {
            if (tile === null) return false;
            return !isBlocking(transform(tile))
        }

        function scan(row: Row): void {
            if (row.depth > maxDistance) return;

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

function* quadrantTransforms(origin: Point): Generator<(tile: Point) => Point> {
    for (const quadrant of ["north", "east", "south", "west"]) {
        if (quadrant === "north")
            yield (tile: Point): Point => { return new Point(origin.x + tile.y, origin.y - tile.x) }
        else if (quadrant === "south")
            yield (tile: Point): Point => { return new Point(origin.x + tile.y, origin.y + tile.x) }
        else if (quadrant === "east")
            yield (tile: Point): Point => { return new Point(origin.x + tile.x, origin.y + tile.y) }
        else // quadrant === "west"
            yield (tile: Point): Point => { return new Point(origin.x - tile.x, origin.y + tile.y) }
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

function insideCircle(tile: Point, origin: Point, radius: number): boolean {
    return Math.pow(tile.x - origin.x, 2) + Math.pow(tile.y - origin.y, 2) <= Math.pow(radius + 0.5, 2);
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
