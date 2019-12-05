import * as fs from 'fs';

let fileContents = fs.readFileSync('../day05.input','utf8')

// Test
// fileContents = "1,9,10,3,2,3,11,0,99,30,40,50"
// fileContents = "1,1,1,4,99,5,6,0,99"
// fileContents = "1101,100,-1,4,0"
// fileContents = "3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9"

let lines = fileContents.split(",")

function get_opcode(value: number): number {
    return value % 100
}

function param_val(insn: number[], param_index: number, values: Array<number>): number {
    let param_mode = ~~(insn[0] / Math.pow(10, param_index + 1)) % 10
    if (param_mode == 0) { // Position mode
        if (insn[param_index] < 0) {
            console.log("Got negative read index")
            return 0
        } else {
            return values[insn[param_index]]
        }
    } else if (param_mode == 1) {   // Immediate mode
        return insn[param_index]
    } else {
        console.log("Error: insn " + insn + " contains undefined parameter mode " + param_mode)
        return 0
    }
}

function run_computer(values: Array<number>, input: number[]) {
    for (let pos = 0; pos < values.length;) {
        switch (get_opcode(values[pos])) {
            case 1: // Add
                {
                    let insn = values.slice(pos, pos + 4)
                    values[values[pos + 3]] = param_val(insn, 1, values) + param_val(insn, 2, values);    
                    pos += insn.length
                }
                break
            case 2: // Mul
                {
                    let insn = values.slice(pos, pos + 4)
                    values[values[pos + 3]] = param_val(insn, 1, values) * param_val(insn, 2, values);    
                    pos += insn.length
                }
                break
            case 3: // Store input
                {
                    if (input.length > 0) {
                        values[values[pos + 1]] = input[0]
                        input.shift()
                    } else {
                        console.log("Error, got input instruction but no input data available")
                    }
                    pos += 2
                }
                break
            case 4: // Show output
                {
                    let insn = values.slice(pos, pos + 2)
                    let output_val = param_val(insn, 1, values)
                    input.push(output_val)
                    console.log("Output: " + output_val)
                    pos += insn.length
                }
                break
            case 5: // Jump-if-true
                {
                    let insn = values.slice(pos, pos + 3)
                    if (param_val(insn, 1, values) != 0) {
                        let new_val = param_val(insn, 2, values)
                        if (new_val < 0 || new_val >= values.length) { console.log("hmm? jumping outside the code ") }
                        pos = new_val
                    } else {
                        pos += insn.length
                    }
                }
                break
            case 6: // Jump-if-false
                {
                    let insn = values.slice(pos, pos + 3)
                    if (param_val(insn, 1, values) == 0) {
                        let new_val = param_val(insn, 2, values)
                        if (new_val < 0 || new_val >= values.length) { console.log("hmm? jumping outside the code ") }
                        pos = new_val
                    } else {
                        pos += insn.length
                    }
                }
                break
            case 7: // Less-than
                {
                    let insn = values.slice(pos, pos + 4)
                    if (param_val(insn, 1, values) < param_val(insn, 2, values)) {
                        values[values[pos + 3]] = 1
                    } else {
                        values[values[pos + 3]] = 0
                    }
                    pos += insn.length
                }
                break
            case 8: // Equals
                {
                    let insn = values.slice(pos, pos + 4)
                    if (param_val(insn, 1, values) == param_val(insn, 2, values)) {
                        values[values[pos + 3]] = 1
                    } else {
                        values[values[pos + 3]] = 0
                    }
                    pos += insn.length
                }
                break
            case 99: // Exit
                pos += 1
                return
            default: 
                console.log("Undefined opcode[" + values[pos] + "] at  " + pos)
                return
        }
    }
}

let values = lines.map(line => Number(line))
let reset_values = values.slice()
// part 1
let input: number[] = []
input.push(1)
run_computer(values, input)
console.log("Part 1: Last outputted value is " + input[input.length - 1])


// part 2
values = reset_values.slice()
input = []
input.push(5)
run_computer(values, input)
console.log("Part 2: Last outputted value is " + input[input.length - 1])