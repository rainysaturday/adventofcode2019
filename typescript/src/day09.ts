import * as fs from 'fs';
import { transcode } from 'buffer';
import { STATUS_CODES } from 'http';

let fileContents = fs.readFileSync('../day09.input','utf8')

// Test
// fileContents = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99"
// fileContents = "104,1125899906842624,99"
// fileContents = "1102,34915192,34915192,7,4,7,99,0"

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

    public run() {
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
                        console.log("Output: " + output_val)
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

// Part1
let s = new IntComputer(reset_values, [1])
s.run()
console.log("Part1: Output of program: " + s.output)

// Part2
s = new IntComputer(reset_values, [2])
s.run()
console.log("Part2: Output of program: " + s.output)
