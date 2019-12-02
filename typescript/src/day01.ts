import * as fs from 'fs';

function fuel(mass: number):number {
    let f = ~~(mass / 3) - 2;
    return f;
}

function fuel2(mass: number):number {
    let total = 0
    let f = ~~(mass / 3) - 2;
    while (f > 0) {
        total += f
        f = ~~(f / 3) - 2;
    }
    return total;
}

function day1() {
    let fileContents = fs.readFileSync('../day01.input','utf8')
    let lines = fileContents.split("\n")
    let sum = 0
    lines.forEach(element => {
        let mass = Number(element)
        sum += fuel(mass)
    });
    console.log("Sum fuel for day1 " + sum)
    sum = 0
    lines.forEach(element => {
        let mass = Number(element)
        sum += fuel2(mass)
    });
    console.log("Sum fuel for day1p2 " + sum)
}

console.log("fuel for " + fuel(12))
console.log("fuel for " + fuel(14))
console.log("fuel for " + fuel(1969))
console.log("fuel for " + fuel(100756))
console.log("fuel2 for " + fuel2(14))
console.log("fuel2 for " + fuel2(1969))
console.log("fuel2 for " + fuel2(100756))
day1()
