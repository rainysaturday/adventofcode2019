import * as fs from 'fs';

let fileContents = fs.readFileSync('../day10.input','utf8')

class Pos {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y
    }

    public toString(): String {
        return "[" + this.x + "," + this.y + "]"
    }
}

// Test
// fileContents = ".#..#\n\
// .....\n\
// #####\n\
// ....#\n\
// ...##\n"
// fileContents = "......#.#.\n\
// #..#.#....\n\
// ..#######.\n\
// .#.#.###..\n\
// .#..#.....\n\
// ..#....#.#\n\
// #..#....#.\n\
// .##.#..###\n\
// ##...#..#.\n\
// .#....####\n"
// fileContents = ".#....#####...#..\n\
// ##...##.#####..##\n\
// ##...#...#.#####.\n\
// ..#.....X...###..\n\
// ..#.#.....#....##\n"
// fileContents = ".#..##.###...#######\n\
// ##.############..##.\n\
// .#.######.########.#\n\
// .###.#######.####.#.\n\
// #####.##.#.##.###.##\n\
// ..#####..#.#########\n\
// ####################\n\
// #.####....###.#.#.##\n\
// ##.#################\n\
// #####.##.###..####..\n\
// ..######..##.#######\n\
// ####.##.####...##..#\n\
// .#####..#.######.###\n\
// ##...#.##########...\n\
// #.##########.#######\n\
// .####.#.###.###.#.##\n\
// ....##.##.###..#####\n\
// .#.#.###########.###\n\
// #.#.#.#####.####.###\n\
// ###.##.####.##.#..##\n"

let map = fileContents.split("\n").filter(l => l.length > 0)
        .map(l => l.split(''))

function get_angle(x: number, y: number, x2: number, y2: number): number {
    let delta_x = x - x2
    let delta_y = y - y2
    let c = Math.sqrt((delta_x * delta_x) + (delta_y * delta_y))
    let v = Math.acos(delta_x / c)

    v = (v / Math.PI) * 180
    if (y < y2) {
        v = 360 - v
    }

    // Reduce precision
    v = (~~(v * 100)) / 100

    return v
}

function dist(x: number, y: number, x2: number, y2: number): number {
    let dx = x - x2;
    let dy = y - y2;
    return Math.sqrt((dx * dx) + (dy*dy))
}

function lookout(monitor_x: number, monitor_y: number): Map<number, Pos[]> {
    let angle_map = new Map<number, Pos[]>()

    // For each asteroid on the map, calculate angle, and then sort by distance for those with same angle
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] == '#') {
                if (x == monitor_x && y == monitor_y) {
                    continue
                }

                // Input angle in map
                let angle = get_angle(monitor_x, monitor_y, x, y)
                let angles = angle_map.get(angle)
                if (angles == undefined) {
                    angles = []
                    angle_map.set(angle, angles)
                }
                angles.push(new Pos(x, y))

                // Sort by distance, closest first
                angles.sort((a, b) => {
                    let adist = dist(monitor_x, monitor_y, a.x, a.y)
                    let bdist = dist(monitor_x, monitor_y, b.x, b.y)
                    return adist - bdist
                })
            }
        }
    }
    return angle_map
}

// Part 1
let best = 0
let best_pos_x = 0
let best_pos_y = 0
for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] == '#') {
            let visible = lookout(x, y).size
            if (visible > best) {
                best = visible
                best_pos_x = x
                best_pos_y = y
            }
        }
    }
}

console.log("Part 1, best position is " + best_pos_x + ", " + best_pos_y + " with " + best)

// Part 2 vaporize
let angle_map = lookout(best_pos_x, best_pos_y)
let angles: number[] = []
for (let angle of angle_map.keys()) {
    angles.push(angle)
}

angles.sort((a, b) => a - b)    // Lol, .sort() is broken for number types... it sorts like string conversion, so you get [0, 10, 100, 11, 110...] instead of [0, 10, 11, 100, 110...]

let zero_angle_index_offset = 0
for (let i = 0; i < angles.length; i++) {
    if (angles[i] >= 90) {   // Our zero is straight up
        zero_angle_index_offset = i
        break
    }
}

for (let vaporized = 0; vaporized < 200;) {
    // Go through all angles and kill the one visible
    for (let i = 0; i < angles.length; i++) {
        let curr_angle = angles[(i + zero_angle_index_offset) % angles.length]
        let asteroids = angle_map.get(curr_angle)
        if (asteroids != undefined && asteroids.length > 0) {
            let vap = asteroids[0]
            asteroids.shift()
            vaporized++
            // console.log("Vaporized " + vaporized + " at " + vap + " at angle " + curr_angle)
            if (vaporized == 200) {
                console.log("Part 2, Vaporized 200th with pos " + vap + " for a score of " + (vap.x * 100 + vap.y))
                break
            }
        }
    }
}
