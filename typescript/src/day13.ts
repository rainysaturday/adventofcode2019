import * as fs from 'fs';

let fileContents = fs.readFileSync('../day13.input','utf8')


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
                ren += c == 0 ? '.' : c
            }
        }
        ren += '\n'
    }
    console.log(ren)
}

let s = new IntComputer(reset_values, [])

while (!s.done_executing) {
    s.run(output => {
        if (output.length == 3) {
            let x = output[0]
            let y = output[1]
            let tile = output[2]
            let id = x + "," + y
            map.set(id, tile)
            return []
        }
        return output
    })
}
render()

let part1 = Array.from(map.values()).filter(tile => tile == 2).length

// Part 2
let p2 = new IntComputer(reset_values, [])

// Clear map
map = new Map()
p2.code[0] = 2   // play for free
let current_score = 0
let paddle_x = 0
let paddle_y = 0
let ball_x = 0
let ball_y = 0
while (!p2.done_executing) {   // Not done and still some blocks left
    // Move so that paddle is always under the ball
    let joystick = 0
    if (paddle_x > ball_x) { // Move left since the paddke is right of the ball
        joystick = -1
    } else if (paddle_x < ball_x) { // Move right since paddle is left of the ball
        joystick = 1
    }
    p2.input = [joystick]
    p2.run(output => {
        if (output.length == 3) {
            let x = output[0]
            let y = output[1]
            let tile = output[2]
            let id = x + "," + y
            if (id == "-1,0") { // Then tile is a score instead
                current_score = tile
            } else {
                map.set(id, tile)

                if (tile == 4) {    // Ball
                    ball_x = x
                    ball_y = y
                } else if (tile == 3) { // Paddle
                    paddle_x = x
                    paddle_y = y
                }
            }
            return []
        }
        return output
    })
    render()

    if (Array.from(map.values()).filter(tile => tile == 2).length == 0) {
        break
    }
}
console.log("Part 1: blocks: " + part1)
console.log("Part 2: score: " + current_score)