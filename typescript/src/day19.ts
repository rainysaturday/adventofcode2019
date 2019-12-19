import * as fs from 'fs';

let fileContents = fs.readFileSync('../day19.input','utf8')


let lines = fileContents.split(",")
const reset_values = lines.map(line => Number(line))

class IntComputer {
    public code: number[]
    public pc: number
    public done_executing: boolean
    public output: number[]
    public input: number[]
    public relative_base: number

    public constructor(code: Array<number>, input: number[]) {
        this.code = code.slice()
        this.pc = 0
        this.done_executing = false
        this.input = input.slice()
        this.output = []
        this.relative_base = 0
    }

    public copy(): IntComputer {
        let carbon = new IntComputer(this.code, this.input);
        carbon.pc = this.pc;
        carbon.done_executing = this.done_executing;
        carbon.output = this.output.slice();
        carbon.relative_base = this.relative_base;
        return carbon;
    }

    private get_opcode(value: number): number {
        return value % 100
    }

    private read_data(values: number[], pos: number): number {
        if (pos >= values.length) {
            return 0
        } else {
            return values[pos]
        }
    }

    private param_val(insn: number[], param_index: number,): number {
        let read_address = this.get_abs_address(param_index)
        if (read_address < 0) {
            console.log("Got negative read index")
            return 0
        } else {
            return this.read_data(this.code, read_address)
        }
    }

    private get_abs_address(param_index: number): number {
        let op = this.code[this.pc]
        let param_mode = ~~(op / Math.pow(10, param_index + 1)) % 10
        if (param_mode == 0) { // Position mode
            return this.code[this.pc + param_index]
        } else if (param_mode == 1) {   // Immediate mode
            return this.pc + param_index
        } else if (param_mode == 2) {   // Relative mode
            return this.relative_base + this.code[this.pc + param_index]
        } else {
            console.log("Error: insn " + op + " contains undefined parameter mode " + param_mode)
            return 0
        }
    }

    private trace(name: String, insn: number[]) {
        // console.log("TRACE: " + this.pc + ": " + name + " " + insn)
    }

    public run(output_handler?: (output: number[]) => number[]) {
        if (this.done_executing) {
            console.log("ERROR: Computer is started when execution is already done. Please reset first.")
            return
        }
        for (; this.pc >= 0;) {
            switch (this.get_opcode(this.read_data(this.code, this.pc))) {
                case 1: // Add
                    {
                        let insn = this.code.slice(this.pc, this.pc + 4)
                        this.trace("Add", insn)
                        this.code[this.get_abs_address(3)] = this.param_val(insn, 1) + this.param_val(insn, 2);
                        this.pc += insn.length
                    }
                    break
                case 2: // Mul
                    {
                        let insn = this.code.slice(this.pc, this.pc + 4)
                        this.trace("Mul", insn)
                        let product = this.param_val(insn, 1) * this.param_val(insn, 2)
                        this.code[this.get_abs_address(3)] = product
                        this.pc += insn.length
                    }
                    break
                    case 3: // Store input
                    {
                        let insn = this.code.slice(this.pc, this.pc + 2)
                        this.trace("Store", insn)
                        if (this.input.length > 0) {
                            this.code[this.get_abs_address(1)] = this.input[0]
                            this.input.shift()
                        } else {
                            // console.log("Got input instruction but no input data available, waiting for more input")
                            return
                        }
                        this.pc += insn.length
                    }
                    break
                    case 4: // Show output
                    {
                        let insn = this.code.slice(this.pc, this.pc + 2)
                        this.trace("Show", insn)
                        let output_val = this.param_val(insn, 1)
                        this.output.push(output_val)
                        // console.log("Output: " + output_val)
                        if (output_handler != undefined) {
                            this.output = output_handler(this.output)
                        }

                        this.pc += insn.length
                    }
                    break
                    case 5: // Jump-if-true
                    {
                        let insn = this.code.slice(this.pc, this.pc + 3)
                        this.trace("Jump-if-true", insn)
                        if (this.param_val(insn, 1) != 0) {
                            let new_val = this.param_val(insn, 2)
                            if (new_val < 0 || new_val >= this.code.length) { console.log("hmm? jumping outside the code ") }
                            this.pc = new_val
                        } else {
                            this.pc += insn.length
                        }
                    }
                    break
                    case 6: // Jump-if-false
                    {
                        let insn = this.code.slice(this.pc, this.pc + 3)
                        this.trace("Jump-if-false", insn)
                        if (this.param_val(insn, 1) == 0) {
                            let new_val = this.param_val(insn, 2)
                            if (new_val < 0 || new_val >= this.code.length) { console.log("hmm? jumping outside the code ") }
                            this.pc = new_val
                        } else {
                            this.pc += insn.length
                        }
                    }
                    break
                    case 7: // Less-than
                    {
                        let insn = this.code.slice(this.pc, this.pc + 4)
                        this.trace("Less-than", insn)
                        if (this.param_val(insn, 1) < this.param_val(insn, 2)) {
                            this.code[this.get_abs_address(3)] = 1
                        } else {
                            this.code[this.get_abs_address(3)] = 0
                        }
                        this.pc += insn.length
                    }
                    break
                    case 8: // Equals
                    {
                        let insn = this.code.slice(this.pc, this.pc + 4)
                        this.trace("Equals", insn)
                        if (this.param_val(insn, 1) == this.param_val(insn, 2)) {
                            this.code[this.get_abs_address(3)] = 1
                        } else {
                            this.code[this.get_abs_address(3)] = 0
                        }
                        this.pc += insn.length
                    }
                    break
                    case 9: // Relative base offset
                    {
                        let insn = this.code.slice(this.pc, this.pc + 2)
                        this.trace("RelBaseOffset", insn)
                        this.relative_base += this.param_val(insn, 1)
                        this.pc += insn.length
                    }
                    break
                    case 99: // Exit
                    this.trace("RelBaseOffset", [99])
                    this.pc += 1
                    this.done_executing = true
                    return
                default:
                    console.log("Undefined opcode[" + this.code[this.pc] + "] at  " + this.pc)
                    return
            }
        }
    }
}

let map = new Map<string, number>()

function color(x: number, y: number, paint?: number): number {
    let id = x + "," + y
    if (paint != undefined) {
        map.set(id, paint)
        return paint
    } else {
        let row = map.get(id)
        if (row == undefined) {
            return -1
        }
        return row
    }
}

function render() {
    let low_x = 0
    let high_x = 0
    let low_y = 0
    let high_y = 0

    for (let val of map.keys()) {
        let parts = val.split(",")
        let x = Number(parts[0])
        let y = Number(parts[1])
        if (x < low_x) { low_x = x }
        if (x > high_x) { high_x = x }
        if (y < low_y) { low_y = y }
        if (y > high_y) { high_y = y }
    }

    let ren = ""
    for (let y = low_y; y <= high_y; y++) {
        for (let x = low_x; x <= high_x; x++) {
            let c = color(x, y)
            if (c < 0) {
                ren += ' '
            } else {
                if (x == 0 && y == 0) {
                    ren += "S"
                } else {
                    if (c == 0) {
                        ren += '#'
                    } else {
                        ren += c
                    }
                }
            }
        }
        ren += '\n'
    }
    console.log(ren)
}


let rendering = ""
let affected = 0
for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
        let s = new IntComputer(reset_values, [x, y])
        while (!s.done_executing) {
            s.run(output => {
                for (let v of output) {
                    if (output[0] == 1) {
                        rendering += '#'
                        affected++
                    } else {
                        rendering += '.'
                    }
                }
                return []
            })
        }
    }
    rendering += "\n"
}

console.log("rendering: \n" + rendering + "\nPart 1, Affected points: " + affected)

// Part 2:
rendering = ""
let y_offset = 1000
let x_offset = 800
for (let y = y_offset; y < 1200; y++) {
    for (let x = x_offset; x < 1000; x++) {
        let s = new IntComputer(reset_values, [x, y])
        while (!s.done_executing) {
            s.run(output => {
                for (let v of output) {
                    if (output[0] == 1) {
                        rendering += '#'
                        affected++
                    } else {
                        rendering += '.'
                    }
                }
                return []
            })
        }
    }
    rendering += "\n"
}

// console.log("p2 rendering: \n" + rendering)

let beam = rendering.split('\n').map(line => line.split(''))
for (let y = 0; y < beam.length; y++) {
    for (let x = beam[0].length - 1; x >= 0; x--) {
        if (beam[y][x] == '#') {    // Found top right corner
            let left_x = x - 99
            let bottom_y = y + 99
            let real_x = left_x + x_offset
            let real_y = y + y_offset
            if (bottom_y < beam.length && left_x >= 0 && beam[y][left_x] == '#' && beam[bottom_y][left_x] == '#') {  // top left and bottom left are also within beam
                console.log("Part 2: found at " + real_x + "," + real_y + " = " + (real_x * 10000 + real_y))
                process.exit(0)
            } else {
                // No need to continue on this line
                break
            }
        }

    }
}