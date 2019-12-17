import * as fs from 'fs';

let fileContents = fs.readFileSync('../day17.input','utf8')


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

let rendering = ""
while (!s.done_executing) {
    s.run(output => {
        for (let v of output) {
            rendering += String.fromCharCode(v)
        }
        return []
    })
}

console.log("Rendering: \n" + rendering)
let ascii_map = rendering.split('\n').filter(l => l.length > 0).map(line => line.split(''))
let dir_delta = [[0, -1], [1, 0], [0, 1], [-1, 0]]

function is_intersection(map: string[][], x: number, y: number): boolean {
    if (x == 0 || x == map[0].length - 1 || y == 0 || y == map.length - 1) {
        return false
    }
    return map[y][x] != '.' && map[y][x + 1] != '.' && map[y][x - 1] != '.' && map[y + 1][x] != '.' && map[y - 1][x] != '.'
}

function is_end(map: string[][], x: number, y: number): boolean {
    if (x == 0 || x == map[0].length - 1 || y == 0 || y == map.length - 1) {
        return false
    }
    return map[y][x] == '#' && [map[y][x + 1], map[y][x - 1], map[y + 1][x], map[y - 1][x]].filter(c => c == '#').length == 1 // We stand on a # and only one # in the surrounding
}

let intersections = new Set<string>()
let intersections_rendered = ""
let alignment_sum = 0
let start_x = 0
let start_y = 0
let num_to_visit  = 0
for (let y = 0; y < ascii_map.length; y++) {
    for (let x = 0; x < ascii_map[0].length; x++) {
        if (ascii_map[y][x] != '.') {
            num_to_visit++
        }
        if (ascii_map[y][x] == '^') {
            start_x = x
            start_y = y
        }
        if (is_intersection(ascii_map, x, y)) {
            ascii_map[y][x] = 'O'
            alignment_sum += x * y
        }
        intersections_rendered += ascii_map[y][x]
    }
    intersections_rendered += "\n"
}

console.log("With intersections: \n" + intersections_rendered)
console.log("Part 1 alignment sum: " + alignment_sum)
console.log("Startpos: " + start_x + "," + start_y)

// Part 2
// Figure out movements
class MoveState {
    x: number
    y: number
    dir: number
    movements: string[]
    cost: number
    visited = new Map<string, number>()
    revisits: number
    constructor(x: number, y: number, dir: number, movements: string[], cost: number, visited: Map<string, number>, revisits: number) {
        this.x = x
        this.y = y
        this.dir = dir
        this.movements = movements.slice()
        this.cost = cost
        Array.from(visited.entries()).forEach(e => this.visited.set(e[0], e[1]))
        this.revisits = revisits
    }
    copy(): MoveState {
        return new MoveState(this.x, this.y, this.dir, this.movements, this.cost, this.visited, this.revisits)
    }
}

function inside(map: string[][], x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < map[0].length && y < map.length
}

let move_queue: MoveState[] = []
move_queue.push(new MoveState(start_x, start_y, 1, ["R"], 0, new Map(), 0))   // Start rotated right
let best_movement: string[] = []
while (move_queue.length > 0) {
    let current_state = move_queue.shift()!

    // Are we still on the path, if not, skip
    if (ascii_map[current_state.y][current_state.x] == undefined || ascii_map[current_state.y][current_state.x] == '.') {
        console.log("Outside, at " + current_state.x + ", " + current_state.y)
        continue
    }
    
    // Visit
    let id = current_state.x + ',' + current_state.y
    let place = current_state.visited.get(id)
    if (place != undefined && place + 100  < current_state.cost) {
        console.log("Revisiting")
        current_state.revisits++
        continue
    }
    current_state.visited.set(id, current_state.cost)
    
    if (is_end(ascii_map, current_state.x, current_state.y)) {
        console.log("End!")
        console.log("Reached end after " + current_state.cost)
    }

    // Visited all?
    if (current_state.visited.size == num_to_visit) {
        best_movement = current_state.movements.slice(0, current_state.movements.length - 1)
        console.log("Visited all with cost " + current_state.cost + " movement: " + best_movement)
        break
    }

    // Walk in dir until corner or intersection
    let steps = 0
    let next_x = current_state.x + dir_delta[current_state.dir][0]
    let next_y = current_state.y + dir_delta[current_state.dir][1]
    while (inside(ascii_map, next_x, next_y) && ascii_map[next_y][next_x] != '.') {  // As long as we are standing on a road, try to step forward
        // Take a step
        steps++
        if (ascii_map[next_y][next_x] == 'O') { // Create new side posibilities if we are at intersection
            let new_movements = current_state.movements.slice()
            new_movements.push(String(steps))

            let left = new MoveState(next_x, next_y, (current_state.dir + dir_delta.length - 1) % dir_delta.length, new_movements, current_state.cost + steps, current_state.visited, current_state.revisits)
            left.movements.push("L")
            let right = new MoveState(next_x, next_y, (current_state.dir + 1) % dir_delta.length, new_movements, current_state.cost + steps, current_state.visited, current_state.revisits)
            right.movements.push("R")
            move_queue.push(left)
            move_queue.push(right)
        }

        // Visit this as well
        current_state.visited.set(next_x + ',' + next_y, current_state.cost + steps)

        // Move
        next_x = next_x + dir_delta[current_state.dir][0]
        next_y = next_y + dir_delta[current_state.dir][1]
    }

    // If we took some steps, record this
    if (steps > 0) {
        current_state.cost += steps
        if (!inside(ascii_map, next_x, next_y) || ascii_map[next_y][next_x] == '.') { // We are outside, step back once
            current_state.x = next_x - dir_delta[current_state.dir][0]
            current_state.y = next_y - dir_delta[current_state.dir][1]
        }
        current_state.movements.push(String(steps))

        // Add new states with different directions
        let left = current_state.copy()
        left.dir = (left.dir + dir_delta.length - 1) % dir_delta.length
        left.movements.push("L")
        let right = current_state.copy()
        right.dir = (right.dir + 1) % dir_delta.length
        right.movements.push("R")

        move_queue.push(left)
        move_queue.push(right)
    } else {
        // No steps in this dir must be the end?
    }

    // Sort on visited and movement length
    move_queue.sort((a, b) => {
        if (a.visited.size == b.visited.size) {
            if (a.revisits == b.revisits) {
                return a.movements.join(',').length - b.movements.join(',').length
            } else {
                return a.revisits - b.revisits
            }
        }
        return b.visited.size - a.visited.size
    })
}

// best_movement:
// R,6,L,10,R,8,R,8,R,12,L,8,L,8,R,6,L,10,R,8,R,8,R,12,L,8,L,8,L,10,R,6,R,6,L,8,R,6,L,10,R,8,R,8,R,12,L,8,L,8,L,10,R,6,R,6,L,8,R,6,L,10,R,8,L,10,R,6,R,6,L,8
// 
// Groups created manually...
// R,6,L,10,R,8 => A
// R,8,R,12,L,8,L,8 => B
// L,10,R,6,R,6,L,8 = C

let main_command = best_movement.join(',')
let a_command = "R,6,L,10,R,8"
let b_command = "R,8,R,12,L,8,L,8"
let c_command = "L,10,R,6,R,6,L,8"
main_command = main_command.replace(new RegExp(a_command, 'g'), "A")
main_command = main_command.replace(new RegExp(b_command, 'g'), "B")
main_command = main_command.replace(new RegExp(c_command, 'g'), "C")
console.log("main_command: " + main_command.length + ": " + main_command)

// Run computer again, but this time with the full proper input
let command_buffer = [main_command, a_command, b_command, c_command, 'n']
let c = new IntComputer(reset_values, [])
c.code[0] = 2   // Wake up
for (let i = 0; !c.done_executing; i++) {

    c.input = (command_buffer[i] + "\n").split('').map(c => c.charCodeAt(0))
    console.log("Provided: " + c.input.join())
    c.run(output => {
        if (output[0] < 128) {
            process.stdout.write(String.fromCharCode(output[0]))
        } else {
            console.log("Got " + output)
        }
        return []
    })
}