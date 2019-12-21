import * as fs from 'fs';

let fileContents = fs.readFileSync('../day21.input','utf8')


let lines = fileContents.split(",")
const reset_values = lines.map(line => Number(line))

class IntComputer {
    public code: number[]
    public pc: number
    public done_executing: boolean
    public output: number[]
    public input: number[]
    public relative_base: number
    public executed_instructions: number

    public constructor(code: Array<number>, input: number[]) {
        this.code = code.slice()
        this.pc = 0
        this.done_executing = false
        this.input = input.slice()
        this.output = []
        this.relative_base = 0
        this.executed_instructions = 0
    }

    public copy(): IntComputer {
        let carbon = new IntComputer(this.code, this.input);
        carbon.pc = this.pc;
        carbon.done_executing = this.done_executing;
        carbon.output = this.output.slice();
        carbon.relative_base = this.relative_base;
        carbon.executed_instructions = this.executed_instructions
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
            this.executed_instructions++
        }
    }
}
// If the fourth is ground and any of the three are holes, jump
let program: string[] = [
    "NOT A J",
    "NOT B T",
    "OR T J",   // A or B is a hole
    "NOT C T",
    "OR T J",   // A or B or C is a hole
    "AND D J",  // (A or B or C is a hole) and D is ground
    "WALK"
]

let hull_damage = 0
let s = new IntComputer(reset_values, (program.join('\n') + "\n").split('').map(c => c.charCodeAt(0)))
while (!s.done_executing) {
    s.run(output => {
        if (output[0] < 128) {
            process.stdout.write(String.fromCharCode(output[0]))
        } else {
            console.log("Got hull damage = " + output[0])
            hull_damage = output[0]
        }
        return []
    })
}

console.log("Part1: hull damage: " + hull_damage)


// Part 2
let program2: string[] = [
    "NOT A J",
    "NOT B T",
    "OR T J",   // A or B is a hole
    "NOT C T",
    "OR T J",   // A or B or C is a hole
    "AND D J",  // Only jump if destination is safe for first jump
    
    "NOT H T",
    "NOT T T",  
    "OR E T",
    "AND T J",  // Only jump if double-jump is safe or if we don't fall immediately after landing the first jump

    "RUN"
]

let hull_damage2 = 0
let s2 = new IntComputer(reset_values, (program2.join('\n') + "\n").split('').map(c => c.charCodeAt(0)))
while (!s2.done_executing) {
    s2.run(output => {
        if (output[0] < 128) {
            process.stdout.write(String.fromCharCode(output[0]))
        } else {
            console.log("Got hull damage = " + output[0])
            hull_damage2 = output[0]
        }
        return []
    })
}

console.log("Part2: hull damage: " + hull_damage2)