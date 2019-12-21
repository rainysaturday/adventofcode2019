import * as fs from 'fs';

let fileContents = fs.readFileSync('../day20.input','utf8')


// Test
// fileContents = 
// "         A           \n\
//          A           \n\
//   #######.#########  \n\
//   #######.........#  \n\
//   #######.#######.#  \n\
//   #######.#######.#  \n\
//   #######.#######.#  \n\
//   #####  B    ###.#  \n\
// BC...##  C    ###.#  \n\
//   ##.##       ###.#  \n\
//   ##...DE  F  ###.#  \n\
//   #####    G  ###.#  \n\
//   #########.#####.#  \n\
// DE..#######...###.#  \n\
//   #.#########.###.#  \n\
// FG..#########.....#  \n\
//   ###########.#####  \n\
//              Z       \n\
//              Z       "
// fileContents = "             Z L X W       C                 \n\
//              Z P Q B       K                 \n\
//   ###########.#.#.#.#######.###############  \n\
//   #...#.......#.#.......#.#.......#.#.#...#  \n\
//   ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  \n\
//   #.#...#.#.#...#.#.#...#...#...#.#.......#  \n\
//   #.###.#######.###.###.#.###.###.#.#######  \n\
//   #...#.......#.#...#...#.............#...#  \n\
//   #.#########.#######.#.#######.#######.###  \n\
//   #...#.#    F       R I       Z    #.#.#.#  \n\
//   #.###.#    D       E C       H    #.#.#.#  \n\
//   #.#...#                           #...#.#  \n\
//   #.###.#                           #.###.#  \n\
//   #.#....OA                       WB..#.#..ZH\n\
//   #.###.#                           #.#.#.#  \n\
// CJ......#                           #.....#  \n\
//   #######                           #######  \n\
//   #.#....CK                         #......IC\n\
//   #.###.#                           #.###.#  \n\
//   #.....#                           #...#.#  \n\
//   ###.###                           #.#.#.#  \n\
// XF....#.#                         RF..#.#.#  \n\
//   #####.#                           #######  \n\
//   #......CJ                       NM..#...#  \n\
//   ###.#.#                           #.###.#  \n\
// RE....#.#                           #......RF\n\
//   ###.###        X   X       L      #.#.#.#  \n\
//   #.....#        F   Q       P      #.#.#.#  \n\
//   ###.###########.###.#######.#########.###  \n\
//   #.....#...#.....#.......#...#.....#.#...#  \n\
//   #####.#.###.#######.#######.###.###.#.#.#  \n\
//   #.......#.......#.#.#.#.#...#...#...#.#.#  \n\
//   #####.###.#####.#.#.#.#.###.###.#.###.###  \n\
//   #.......#.....#.#...#...............#...#  \n\
//   #############.#.#.###.###################  \n\
//                A O F   N                     \n\
//                A A D   M                     "


let map = fileContents.split("\n").map(l => l.split(''))

function m(x: number, y: number): string {
    if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
        return map[y][x]
    } else {
        return ' '
    }
}

class Pos {
    x: number = 0
    y: number = 0

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y
    }

    public toString(): string {
        return '[' + this.x + "," + this.y + ']'
    }
}

function is_letter(c: string): boolean {
    return c.toLocaleLowerCase() != c.toLocaleUpperCase()
}

class PortalInfo {
    name: string
    positions: Pos[]
    level_direction: number // Either -1, 1 or 0 (0 only for AA and ZZ)
    constructor(name: string, positions: Pos[], direction: number) {
        this.name = name
        this.positions = positions.slice()
        this.level_direction = direction
    }
}

// Return portal name or undefined
function get_portal(x: number, y: number): PortalInfo | undefined {
    let first = m(x, y)
    if (is_letter(first)) {
        for (let delta of dir_delta) {
            let second = m(x + delta[0], y + delta[1])
            if (is_letter(second)) {
                let portal_name = ""
                if (delta[1] < 0) {
                    portal_name = second + first
                } else if (delta[1] > 0) {
                    portal_name = first + second
                } else {
                    if (delta[0] < 0) {
                        portal_name = second + first
                    } else {
                        portal_name = first + second
                    }
                }

                // Figure out direction if we are inner or outer
                let level_direction = 0
                if (x <= 1 || x >= map[0].length - 2 || y <= 1 || y >= map.length - 2) {   // Outer portal
                    level_direction = -1    // Go down one level
                } else {    // Inner portal
                    level_direction = 1    // Go up one level
                }
                if (portal_name == "AA" || portal_name == "ZZ") {   // AA and ZZ have no level direction
                    level_direction = 0
                }
                return new PortalInfo(portal_name, [], level_direction)
            }
        }
    }
    return undefined
}

// Find all portals by visiting each dot, if any portal is near, record this position as a close_to_portal position
let dir_delta = [[0, 1], [0, -1], [1, 0], [-1, 0]]
let close_to_portal = new Map<string, PortalInfo>()  // Map over portal names and their portal info

for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
        if (m(x, y) == '.') {
            // Look around
            for (let delta of dir_delta) {
                let portal = get_portal(x + delta[0], y + delta[1])
                if (portal != undefined) {
                    let portal_info = close_to_portal.get(portal.name)
                    if (portal_info == undefined) {
                        portal_info = portal
                    }
                    portal_info.positions.push(new Pos(x, y))
                    close_to_portal.set(portal.name, portal_info)
                }
            }
        }
    }
}

for (let portal of close_to_portal.keys()) {
    let portal_info = close_to_portal.get(portal)!
    console.log("Parsed portal: " + portal + ": " + Array.from(portal_info.positions))
}

let start_pos = close_to_portal.get("AA")!.positions[0]
console.log("Start position: " + start_pos)

class MoveState {
    pos: Pos
    steps: number

    constructor(pos: Pos, steps: number) {
        this.pos = new Pos(pos.x, pos.y)
        this.steps = steps
    }

    copy(): MoveState {
        return new MoveState(this.pos, this.steps)
    }
}

// Part 1
let move_queue: MoveState[] = []
move_queue.push(new MoveState(start_pos, 0))
let visited = new Map<string, number>()

let found = false
while (move_queue.length > 0 && !found) {
    let current = move_queue.shift()!

    let place = visited.get(current.pos.toString())
    if (place != undefined && place < current.steps) {
        continue
    }
    visited.set(current.pos.toString(), current.steps)

    let below = m(current.pos.x, current.pos.y)
    if (below != '.') {
        continue
    }

    // Add new moves
    for (let delta of dir_delta) {
        let new_x = current.pos.x + delta[0]
        let new_y = current.pos.y + delta[1]
        let portal = get_portal(new_x, new_y)
        if (portal != undefined) {  // If portal, need to modify
            if (portal.name == "AA") { // Dont add this move since we can't go back
                continue
            } else if (portal.name == "ZZ") {
                console.log("Part1: Found exit at " + (current.steps) + " steps")
                found = true
            } else {
                // Warp to other place instead
                let positions = close_to_portal.get(portal.name)!.positions
                if (positions[0].x == current.pos.x && positions[0].y == current.pos.y) {
                    new_x = positions[1].x
                    new_y = positions[1].y
                } else {
                    new_x = positions[0].x
                    new_y = positions[0].y
                }
            }
        }

        move_queue.push(new MoveState(new Pos(new_x, new_y), current.steps + 1))
    }

    // Sort on steps
    move_queue.sort((a, b) => a.steps - b.steps)
}


// Part 2
class MoveState2 {
    pos: Pos
    steps: number
    level: number

    constructor(pos: Pos, steps: number, level: number) {
        this.pos = new Pos(pos.x, pos.y)
        this.steps = steps
        this.level = level
    }

    copy(): MoveState2 {
        return new MoveState2(this.pos, this.steps, this.level)
    }
}

let move_queue2: MoveState2[] = []
move_queue2.push(new MoveState2(start_pos, 0, 0))
let visited2 = new Map<string, number>()
let best_steps = undefined
while (move_queue2.length > 0) {
    let current = move_queue2.shift()!

    if (best_steps != undefined) {
        // console.log("queue: " + move_queue2.length)
        if (current.steps >= best_steps) {
            continue
        }
    }

    let visit_id = current.pos + "-" + current.level
    let place = visited2.get(visit_id)
    if (place != undefined && place < current.steps) {
        continue
    }
    visited2.set(visit_id, current.steps)

    let below = m(current.pos.x, current.pos.y)
    if (below != '.') {
        continue
    }

    // Add new moves
    for (let delta of dir_delta) {
        let new_x = current.pos.x + delta[0]
        let new_y = current.pos.y + delta[1]
        let portal = get_portal(new_x, new_y)
        let new_level = current.level
        if (portal != undefined) {  // If portal, need to modify
            if (portal.name == "AA") { // Dont add this move since we can't go back, AA is wall on all levels
                continue
            } else if (portal.name == "ZZ") {
                if (current.level == 0) {
                    console.log("Found exit at " + (current.steps) + " steps")
                    if (best_steps == undefined || best_steps > current.steps) {
                        best_steps = current.steps
                    }
                    continue
                } else {
                    continue // ZZ is wall on other levels
                }
            } else {
                if (current.level == 0 && portal.level_direction < 0) {
                    continue // all outer portals are walls on the first level
                }
                // Warp to other place instead
                let positions = close_to_portal.get(portal.name)!.positions
                if (positions[0].x == current.pos.x && positions[0].y == current.pos.y) {
                    new_x = positions[1].x
                    new_y = positions[1].y
                } else {
                    new_x = positions[0].x
                    new_y = positions[0].y
                }
                new_level = current.level + portal.level_direction
            }
        }

        move_queue2.push(new MoveState2(new Pos(new_x, new_y), current.steps + 1, new_level))
    }

    // Sort on steps with some penalty for each level
    move_queue2.sort((a, b) => {
        return (a.steps + a.level * 10000) - (b.steps + b.level * 10000)
    })
}

console.log("Part2: best steps: " + best_steps)
// Could use some optimization, finds a solution for part 2 in <1 second, but takes some 4 minutes to confirm that it is actually the best