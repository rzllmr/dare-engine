
use wasm_bindgen::prelude::*;
use std::collections::VecDeque;

extern crate console_error_panic_hook;

extern crate web_sys;
// log(format!("test: {}", variable).as_str());
pub fn log(message: &str) {
    web_sys::console::log_1(&message.into());
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub struct Point {
    x: i32,
    y: i32
}

#[wasm_bindgen]
pub fn point_struct(x: i32, y: i32) -> Point {
    return Point { x: x, y: y };
}

// Rust implementation of an iterative queue flood fill algorithm
// explained at https://codeheir.com/2022/08/21/comparing-flood-fill-algorithms-in-javascript/

#[wasm_bindgen]
pub fn unveil_room(
    origin: Point,
    blocking: Vec<u8>,
    boundaries: Point,
    max_distance: i32
) -> Vec<u8> {
    console_error_panic_hook::set_once();

    let mut visited: Vec<u8> = vec![0; blocking.len()];
    let mut visibles: Vec<u8> = vec![0; blocking.len()];

    let x_dim = boundaries.x;
    let mut queue = VecDeque::from([origin]);
    while queue.len() > 0 {
        let current = queue.pop_front().unwrap();
        for direction in directions() {
            let child = add_points(&current, &direction);
            let index: usize = (child.x + child.y * x_dim) as usize;
            if index >= visited.len() { continue; }

            if visited[index] == 1 { continue; }
            visited[index] = 1;

            if !inside_boundaries(&child, &boundaries) { continue; }
            if !inside_circle(&child, &origin, &max_distance) { continue; }

            visibles[index] = 1;
            if blocking[index] == 0 {
                queue.push_back(child);
            }
        }
    }

    return visibles;
}

#[wasm_bindgen]
pub fn find_next(
    origin: Point,
    ground: Vec<u8>,
    boundaries: Point,
    max_distance: i32
) -> usize {
    console_error_panic_hook::set_once();

    let mut visited: Vec<u8> = vec![0; ground.len()];

    let x_dim = boundaries.x;
    let mut queue = VecDeque::from([origin]);
    while queue.len() > 0 {
        let current = queue.pop_front().unwrap();
        for direction in directions() {
            let child = add_points(&current, &direction);
            let index: usize = (child.x + child.y * x_dim) as usize;
            if index >= visited.len() { continue; }

            if visited[index] == 1 { continue; }
            visited[index] = 1;

            if !inside_boundaries(&child, &boundaries) { continue; }
            if !inside_circle(&child, &origin, &max_distance) { continue; }

            if ground[index] == 1 { return index; }

            queue.push_back(child);
        }
    }

    return 0;
}

pub fn add_points(a: &Point, b: &Point) -> Point {
    return point_struct(a.x + b.x, a.y + b.y);
}

pub fn inside_boundaries(coord: &Point, boundaries: &Point) -> bool {
    return coord.x >= 0 && coord.y >= 0 && coord.x <= boundaries.x && coord.y <= boundaries.y;
}

pub fn inside_circle(coord: &Point, origin: &Point, radius: &i32) -> bool {
    if *radius == 0 { return true; }
    let distance = ((coord.x - origin.x).pow(2) + (coord.y - origin.y).pow(2)) as f32;
    let extended_radius = (*radius as f32 + 0.5).powi(2);
    return distance <= extended_radius;
}

pub fn directions() -> [Point; 8] {
    return [
        Point { x: 0, y: 1 },   // north
        Point { x: 1, y: 1 },   // north-east
        Point { x: 1, y: 0 },   // east
        Point { x: 1, y: -1 },  // south-east
        Point { x: 0, y: -1 },  // south
        Point { x: -1, y: -1 }, // south-west
        Point { x: -1, y: 0 },  // west
        Point { x: -1, y: 1 }   // north-west
    ];
}

// Rust implementation of the algorithm developed by Albert Ford
// licensed under Creative Commons Zero v1.0 Universal
// hosted at https://github.com/370417/symmetric-shadowcasting.git
// explained at https://www.albertford.com/shadowcasting/
//
// It satisfies six desirable properties for field of view algorithms in rogue-likes
// defined by Adam Milazzo at http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html:
// symmetry, expansive walls, expanding pillar shadows, no blind corners, no artifacts, efficiency

#[wasm_bindgen]
pub fn compute_fov(
    origin: Point,
    blocking: Vec<u8>,
    boundaries: Point,
    max_distance: i32
) -> Vec<f32> {
    console_error_panic_hook::set_once();

    let to_idx = |coord: &Point| -> usize {
        return (coord.x + coord.y * boundaries.x) as usize;
    };

    let mut visibles: Vec<f32> = vec![0.0; blocking.len()];
    visibles[to_idx(&origin)] = 1.0;

    for quadrant in ["north", "south", "east", "west"] {
        let transform = |tile: &Point| -> Point {
            match quadrant {
                "north" => return Point { x: origin.x + tile.y, y: origin.y - tile.x },
                "south" => return Point { x: origin.x + tile.y, y: origin.y + tile.x },
                "east"  => return Point { x: origin.x + tile.x, y: origin.y + tile.y },
                _       => return Point { x: origin.x - tile.x, y: origin.y + tile.y }
            }
        };

        let is_wall = |coord: &Point| -> bool {
            if coord.x == -1 { return false; }
            return blocking[to_idx(&transform(coord))] == 1;
        };
        let is_floor = |coord: &Point| -> bool {
            if coord.x == -1 { return false; }
            return blocking[to_idx(&transform(coord))] == 0;
        };
        let mut reveal = |coord: &Point| {
            let transformed = transform(coord);
            if inside_boundaries(&transformed, &boundaries) && inside_circle(&transformed, &origin, &max_distance) {
                visibles[to_idx(&transformed)] = distance(&transformed, &origin, &max_distance);
            }
        };

        let first_row = Row::new(1, Fraction::new(-1, 1),  Fraction::new(1, 1));
        let mut rows = Vec::from([first_row]);
        while rows.len() > 0 {
            let mut row = rows.pop().unwrap();
            let mut prev_tile = Point { x: -1, y: -1 };
            for tile in row.tiles() {
                if is_wall(&tile) || is_symmetric(&row, &tile) {
                    reveal(&tile);
                }
                if is_wall(&prev_tile) && is_floor(&tile) {
                    row.start_slope = slope(&tile);
                }
                if is_floor(&prev_tile) && is_wall(&tile) {
                    let mut next_row = row.next();
                    next_row.end_slope = slope(&tile);
                    rows.push(next_row);
                }
                prev_tile = tile;
            }
            if is_floor(&prev_tile) {
                rows.push(row.next());
            }
        }
    }

    return visibles;
}

#[derive(Copy, Clone, Debug)]
struct Row { depth: i32, start_slope: Fraction, end_slope: Fraction }
impl Row {
    fn new(depth: i32, start_slope: Fraction, end_slope: Fraction) -> Row {
        return Row { depth: depth, start_slope: start_slope, end_slope: end_slope };
    }

    // tiles 1 Object { numerator: -1, denominator: 1 } Object { numerator: 1, denominator: 1 }
    fn tiles(&self) -> Vec<Point> {
        let min_col = round_ties_up(self.start_slope.multiply(self.depth));
        let max_col = round_ties_down(self.end_slope.multiply(self.depth));
        let mut tiles = vec![Point { x: 0, y: 0 }; (max_col + 1 - min_col) as usize];
        for i in 0..tiles.len() {
            tiles[i] = Point { x: self.depth, y: i as i32 + min_col };
        }
        return tiles;
    }

    fn next(&self) -> Row {
        return Row::new(self.depth + 1, self.start_slope, self.end_slope);
    }
}

#[derive(Copy, Clone, Debug)]
struct Fraction { numerator: i32, denominator: i32 }
impl Fraction {
    fn new(numerator: i32, denominator: i32) -> Fraction {
        return Fraction { numerator: numerator, denominator: denominator };
    }

    fn multiply(&self, multiplier: i32) -> f32 {
        return (multiplier * self.numerator) as f32 / self.denominator as f32;
    }
}

fn round_ties_up(n: f32) -> i32 {
    return (n + 0.5).floor() as i32;
}

fn round_ties_down(n: f32) -> i32 {
    return (n - 0.5).ceil() as i32;
}

fn slope(tile: &Point) -> Fraction {
    return Fraction::new(2 * tile.y - 1, 2 * tile.x);
}

fn is_symmetric(row: &Row, tile: &Point) -> bool {
    return tile.y as f32 >= row.start_slope.multiply(row.depth) && tile.y as f32 <= row.end_slope.multiply(row.depth);
}

fn distance(coord: &Point, origin: &Point, radius: &i32) -> f32 {
    let distance = ((coord.x - origin.x).pow(2) + (coord.y - origin.y).pow(2)) as f32;
    let extended_radius = (*radius as f32 + 0.9).powi(2);
    return (1.0 - distance / extended_radius).powf(1.0);
}
