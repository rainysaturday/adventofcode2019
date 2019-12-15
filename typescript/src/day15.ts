import * as fs from 'fs';

let fileContents = fs.readFileSync('../day15.input','utf8')


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

let s = new IntComputer(reset_values, [])

class MoveState {
    x: number
    y: number
    steps: number
    movement_command: number
    computer: IntComputer
    constructor(x: number, y: number, steps: number, movement_command: number, computer: IntComputer) {
        this.x = x;
        this.y = y;
        this.steps = steps;
        this.movement_command = movement_command;
        this.computer = computer.copy()
    }
}

let move_queue: MoveState[] = []
let visited = new Map<string, number>()

let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]

function add_all_steps(current_state: MoveState, step_queue: MoveState[]) {
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i]
        let new_x = current_state.x + dir[0]
        let new_y = current_state.y + dir[1]

        step_queue.push(new MoveState(new_x, new_y, current_state.steps + 1, i + 1, current_state.computer))
    }

    step_queue.sort((a, b) => a.steps - b.steps) // Fewest steps should be first
}

add_all_steps(new MoveState(0, 0, 0, 0, s), move_queue) // Initial state
let repair_position_x = 0;
let repair_position_y = 0;
let repair_steps = 0
while (!s.done_executing) {
    let current_state = move_queue.shift()!
    if (current_state == undefined) {
        // All steps finished, map should be complete at this point
        break;
    }

    let id = current_state.x + "," + current_state.y
    let visited_with_steps = visited.get(id)
    if (visited_with_steps != undefined) {
        if (visited_with_steps < current_state.steps) { // Already been here cheaper
            continue
        }
    }

    // Visit first time or with a better path
    visited.set(id, current_state.steps)

    let add_steps = false
    current_state.computer.input = [current_state.movement_command]
    current_state.computer.output = []
    current_state.computer.run(output => {
        color(current_state.x, current_state.y, output[0])
        if (output[0] == 2) {
            // Part 1 found it
            repair_steps = current_state.steps
            repair_position_x = current_state.x
            repair_position_y = current_state.y
        }

        // Not a wall, lets add new steps
        if (output[0] != 0) {
            add_steps = true
        }
        
        return []
    })

    if (add_steps) {
        add_all_steps(current_state, move_queue)
    }

    render()
}

// Part 2, fill map, starting from repair_position
class FillState {
    x: number
    y: number
    layer: number
    constructor(x: number, y: number, layer: number) {
        this.x = x
        this.y = y
        this.layer = layer
    }
}
visited = new Map()
let fill_queue: FillState[] = []
fill_queue.push(new FillState(repair_position_x, repair_position_y, 0))
let highest_layer = 0
while (fill_queue.length > 0) {
    let current = fill_queue.shift()!

    let id = current.x + "," + current.y
    let place = map.get(id)
    if (place != undefined && (place == 8 || place == 0)) { // Already been here, or unwalkable
        continue
    }
    map.set(id, 8)   // Use 8 for oxygen

    if (highest_layer < current.layer) {
        highest_layer = current.layer
    }

    // Add new positions
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i]
        let new_x = current.x + dir[0]
        let new_y = current.y + dir[1]

        fill_queue.push(new FillState(new_x, new_y, current.layer + 1))
    }
    fill_queue.sort((a, b) => a.layer - b.layer)

    render()
}

console.log("Part 1, found the thing to repair after " + repair_steps + " steps")
console.log("Part 2, filled after " + highest_layer + " minutes")