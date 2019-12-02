import * as fs from 'fs';

let fileContents = fs.readFileSync('../day02.input','utf8')

// Test
// fileContents = "1,9,10,3,2,3,11,0,99,30,40,50"
// fileContents = "1,1,1,4,99,5,6,0,99"

let lines = fileContents.split(",")

function run_computer(values: Array<number>, noun: number, verb: number) {
    // Fix gravity
    values[1] = noun
    values[2] = verb

    for (let pos = 0; pos < values.length;) {
        switch (values[pos]) {
            case 1: // Add
                values[values[pos + 3]] = values[values[pos + 1]] + values[values[pos + 2]];
                pos += 4
                break
            case 2: // Mul
                values[values[pos + 3]] = values[values[pos + 1]] * values[values[pos + 2]];
                pos += 4
                break
            case 99: // Exit
                pos += 1
                return
            default: console.log("Undefined opcode: " + values[pos])
        }
    }
}

let values = lines.map(line => Number(line))
let reset_values = values.slice()

// part 1
run_computer(values, 12, 2)
console.log("Value left in position 0: " + values[0])

// part 2
for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
        // Reset
        values = reset_values.slice()

        run_computer(values, noun, verb)

        if (values[0] == 19690720) {
            console.log("noun " + noun + " and verb " + verb + " means value is " + ((100 * noun) + verb))
            process.exit(0)
        }
    }
}
