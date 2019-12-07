import * as fs from 'fs';

let fileContents = fs.readFileSync('../day07.input','utf8')

// Test
// fileContents = "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0"
// fileContents = "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0"
// fileContents = "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0"

// p2 tests
// fileContents = "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5"

let lines = fileContents.split(",")
const reset_values = lines.map(line => Number(line))

class ExecState {
    public code: number[]
    public pc: number
    public done_executing: boolean
    public output: number[]
    public input: number[]
    public constructor(code: Array<number>, input: number[]) {
        this.code = code.slice()
        this.pc = 0
        this.done_executing = false
        this.input = input.slice()
        this.output = []
    }
}

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

function run_computer(state: ExecState) {
    for (; state.pc < state.code.length;) {
        switch (get_opcode(state.code[state.pc])) {
            case 1: // Add
                {
                    let insn = state.code.slice(state.pc, state.pc + 4)
                    state.code[state.code[state.pc + 3]] = param_val(insn, 1, state.code) + param_val(insn, 2, state.code);    
                    state.pc += insn.length
                }
                break
            case 2: // Mul
                {
                    let insn = state.code.slice(state.pc, state.pc + 4)
                    state.code[state.code[state.pc + 3]] = param_val(insn, 1, state.code) * param_val(insn, 2, state.code);    
                    state.pc += insn.length
                }
                break
            case 3: // Store input
                {
                    if (state.input.length > 0) {
                        state.code[state.code[state.pc + 1]] = state.input[0]
                        state.input.shift()
                    } else {
                        // console.log("Got input instruction but no input data available, waiting for more input")
                        return
                    }
                    state.pc += 2
                }
                break
            case 4: // Show output
                {
                    let insn = state.code.slice(state.pc, state.pc + 2)
                    let output_val = param_val(insn, 1, state.code)
                    state.output.push(output_val)
                    // console.log("Output: " + output_val)
                    state.pc += insn.length
                }
                break
            case 5: // Jump-if-true
                {
                    let insn = state.code.slice(state.pc, state.pc + 3)
                    if (param_val(insn, 1, state.code) != 0) {
                        let new_val = param_val(insn, 2, state.code)
                        if (new_val < 0 || new_val >= state.code.length) { console.log("hmm? jumping outside the code ") }
                        state.pc = new_val
                    } else {
                        state.pc += insn.length
                    }
                }
                break
            case 6: // Jump-if-false
                {
                    let insn = state.code.slice(state.pc, state.pc + 3)
                    if (param_val(insn, 1, state.code) == 0) {
                        let new_val = param_val(insn, 2, state.code)
                        if (new_val < 0 || new_val >= state.code.length) { console.log("hmm? jumping outside the code ") }
                        state.pc = new_val
                    } else {
                        state.pc += insn.length
                    }
                }
                break
            case 7: // Less-than
                {
                    let insn = state.code.slice(state.pc, state.pc + 4)
                    if (param_val(insn, 1, state.code) < param_val(insn, 2, state.code)) {
                        state.code[state.code[state.pc + 3]] = 1
                    } else {
                        state.code[state.code[state.pc + 3]] = 0
                    }
                    state.pc += insn.length
                }
                break
            case 8: // Equals
                {
                    let insn = state.code.slice(state.pc, state.pc + 4)
                    if (param_val(insn, 1, state.code) == param_val(insn, 2, state.code)) {
                        state.code[state.code[state.pc + 3]] = 1
                    } else {
                        state.code[state.code[state.pc + 3]] = 0
                    }
                    state.pc += insn.length
                }
                break
            case 99: // Exit
                state.pc += 1
                state.done_executing = true
                return
            default: 
                console.log("Undefined opcode[" + state.code[state.pc] + "] at  " + state.pc)
                return
        }
    }
}

function run_phase(phase_setting: number[], last_output: number[]): number[] {
    const states: ExecState[] = []

    // Initialize phase and signal values
    for (let amp_id = 0; amp_id < phase_setting.length; amp_id++) {
        let input: number[] = []
        input.push(phase_setting[amp_id])
        if (amp_id == 0) {
            for (let i = 0; i < last_output.length; i++) {
                input.push(last_output[i])
            }
        }
        states.push(new ExecState(reset_values, input))
    }

    while (states.some(s => !s.done_executing)) { // Loop until all are done
        for (let amp_id = 0; amp_id < phase_setting.length; amp_id++) {
            let state = states[amp_id]
            if (state.done_executing) {
                continue
            }

            // Append all generated output from amplifier before it to this input state, and then continue executing
            let amp_before_id = amp_id - 1
            if (amp_before_id < 0) {
                amp_before_id = states.length - 1
            }
            for (let i = 0; i < states[amp_before_id].output.length; i++) {
                state.input.push(states[amp_before_id].output[i])
            }
            states[amp_before_id].output = []   // All output is now consumed of the previous amplifier

            // Run computer
            run_computer(state)
        }
    }

    return states[states.length - 1].output
}


function find_max_thruster(phase_offset: number): [number, number[]] {
    const phase_max = 5
    let current_max = 0
    let current_phase_max: number[] = []
    for (let a = 0; a < phase_max; a++) {
        for (let b = 0; b < phase_max; b++) {
            for (let c = 0; c < phase_max; c++) {
                for (let d = 0; d < phase_max; d++) {
                    for (let e = 0; e < phase_max; e++) {
                        let phase = [a, b, c, d, e]
                        // Skip if duplicated phase setting
                        let s = new Set<number>()
                        for (let i = 0;  i< phase.length; i++) {
                            phase[i] = phase[i] + phase_offset
                            s.add(phase[i])
                        }
                        if (s.size != phase.length) {
                            continue
                        }

                        let output = run_phase(phase, [0])
                        if (output[output.length - 1] > current_max) {
                            current_max = output[output.length - 1]
                            current_phase_max = phase
                        }
                    }
                }
            }
        }
    }
    return [current_max, current_phase_max]
}

// Part 1
let [max, phase] = find_max_thruster(0)
console.log("Part 1: Max thruster signal is " + max + " for phase " + phase)

// Part 2
let [max2, phase2] = find_max_thruster(5)   // Offset 5 for feedback loop
console.log("Part 2: Max thruster signal is " + max2 + " for phase " + phase2)