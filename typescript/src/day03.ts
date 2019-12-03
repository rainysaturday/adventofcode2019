import * as fs from 'fs';

let fileContents = fs.readFileSync('../day03.input','utf8')
let lines = fileContents.split("\n")

// Test
// lines = ["R75,D30,R83,U83,L12,D49,R71,U7,L72",
//          "U62,R66,U55,R34,D71,R55,D58,R83"]
// lines = ["R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51",
//          "U98,R91,D20,R16,D67,R40,U7,R15,U6,R7"]
// lines = ["R8,U5,L5,D3",
//          "U7,R6,D4,L4"]

let map = new Map<String, [number, number]>()   // Model: String for position, and then array value of [bitwise mask of lineids, sum of taken steps]

// Walk lines
for (let lineid = 1; lineid < 3; lineid++) {
    let line = lines[lineid - 1]
    let pos: [number, number] = [0, 0]
    let steps = 0
    for (let dir of line.split(",")) {
        let length = Number(dir.substring(1))
        let delta: [number, number] = [0, 0]
        switch (dir[0]) {
            case 'L':
                delta = [-1, 0]
                break
            case 'R':
                delta = [1, 0]
                break
            case 'U':
                delta = [0, -1]
                break
            case 'D':
                delta = [0, 1]
                break
        }

        for (let i = 0; i < length; i++) {
            pos[0] += delta[0]
            pos[1] += delta[1]
            steps += 1
            let posString = pos.join(',')
            let current = map.get(posString)
            if (current) {
                // We're at an intersection, add our current steps if our lineid has not already been here
                if ((current[0] & lineid) != lineid) {
                    map.set(posString, [current[0] | lineid, current[1] + steps])
                }
            } else {
                map.set(posString, [lineid, steps])
            }
        }
    }
}

function manhattan(x: number, y: number) {
    return Math.abs(x) + Math.abs(y)
}

let closest = 0
let fewest = 0
for (let entry of map.entries()) {
    if (entry[1][0] == 3 && entry[0] != "0,0") { // Intersection at non-zero
        let [x, y] = entry[0].split(",").map(n => Number(n))
        let new_dist = manhattan(x, y)
        if (new_dist < closest || closest == 0) {
            closest = new_dist
        }

        if (entry[1][0] == 3) {
            if (entry[1][1] < fewest || fewest == 0) {
                fewest = entry[1][1]
            }
        }
    }
}

function paint() {
    const size = 10
    let rendered = ""
    for (let y: number = -size; y < size; y++) {
        for (let x: number = -size; x < size; x++) {
            let val = map.get(x + ',' + y)
            if (!val) {
                rendered += '.'
            } else {
                rendered += val[0]
            }
        }
        rendered += '\n'
    }
    console.log(rendered)
}

console.log("Closest intersection is " + closest)
console.log("Intersection with fewest total steps " + fewest)