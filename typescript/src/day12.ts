import * as fs from 'fs';
let lcm = require('compute-lcm')

let fileContents = fs.readFileSync('../day12.input','utf8')

// Test
// fileContents = "<x=-1, y=0, z=2>\n\
// <x=2, y=-10, z=-7>\n\
// <x=4, y=-8, z=8>\n\
// <x=3, y=5, z=-1>"
// fileContents = "<x=-8, y=-10, z=0>\n\
// <x=5, y=5, z=10>\n\
// <x=2, y=-7, z=3>\n\
// <x=9, y=-8, z=-3>"

class Vec3 {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: Vec3): Vec3 {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    toString(): string {
        return "<x=" + this.x + ", y=" + this.y + ", z=" + this.z + ">"; 
    }

    abs_sum(): number {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }

    equals(other: Vec3): boolean {
        return this.x == other.x && this.y == other.y  && this.z == other.z;
    }
}

class Moon {
    pos: Vec3
    velocity: Vec3
    constructor(pos: Vec3) {
        this.pos = new Vec3(pos.x, pos.y, pos.z);
        this.velocity = new Vec3(0, 0, 0);
    }

    toString(): string {
        return "{pos=" + this.pos + ", vel=" + this.velocity + "}"
    }
}

let moons = fileContents.split("\n").map(l => {
        let nums = l.match(/(-?[0-9]+)/g);
        if (nums != null) {
            let nums2 = nums.map(s => Number(s));
            return new Moon(new Vec3(nums2[0], nums2[1], nums2[2]));
        } else {
            console.log("Bad line: " + l + " got " + nums);
        }
        return undefined;
    })
    .map(m => m as Moon);

console.log("Parsed " + moons)

let initial_moons: Moon[] = []
for (let m of moons) {
    initial_moons.push(new Moon(m.pos))
}

function apply_gravity() {
    for (let i = 0; i < moons.length; i++) {
        for (let u = i+1; u < moons.length; u++) {
            let a = moons[i];
            let b = moons[u];

            if (a.pos.x < b.pos.x) {
                a.velocity.x++
                b.velocity.x--
            } else if (a.pos.x > b.pos.x) {
                a.velocity.x--
                b.velocity.x++
            }

            if (a.pos.y < b.pos.y) {
                a.velocity.y++
                b.velocity.y--
            } else if (a.pos.y > b.pos.y) {
                a.velocity.y--
                b.velocity.y++
            }

            if (a.pos.z < b.pos.z) {
                a.velocity.z++
                b.velocity.z--
            } else if (a.pos.z > b.pos.z) {
                a.velocity.z--
                b.velocity.z++
            }
        }
    }
}

function total_energy(): number {
    let total = 0;
    moons.forEach(m => total += m.pos.abs_sum() * m.velocity.abs_sum());
    return total;
}

let periods: number[] = [0, 0, 0]

for (let time = 0;; time++) {
    // Part 1 Total energy
    if (time == 1000) {
        console.log("Part 1 total energy after 1000 iterations: " + total_energy());
    }

    // Figure out all the periods, when all moons are back at their starting point for a given dimension, save the time since this is the period
    // If all X positions are in correct place, save X time
    if (moons.every((moon, index) => moon.pos.x == initial_moons[index].pos.x && moon.velocity.x == initial_moons[index].velocity.x)) {
        if (periods[0] == 0) {
            periods[0] = time;
        }
    }
    // If all Y positions are in correct place, save Y time
    if (moons.every((moon, index) => moon.pos.y == initial_moons[index].pos.y && moon.velocity.y == initial_moons[index].velocity.y)) {
        if (periods[1] == 0) {
            periods[1] = time;
        }
    }
    // If all Z positions are in correct place, save Z time
    if (moons.every((moon, index) => moon.pos.z == initial_moons[index].pos.z && moon.velocity.z == initial_moons[index].velocity.z)) {
        if (periods[2] == 0) {
            periods[2] = time;
        }
    }

    // Found all periods?
    if (periods.every(v => v != 0)) {
        break;
    }

    apply_gravity();

    // Add velocities
    moons.forEach(m => m.pos = m.pos.add(m.velocity))
}

// Part 2, find the combined period for all three dimensions by finding the lowest common multiple of all the periods
console.log("Part 2 periods: " + periods + " Combined period for all three dimensions: " + lcm(periods))