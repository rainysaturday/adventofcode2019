import * as fs from 'fs';
import { eventNames } from 'cluster';

let fileContents = fs.readFileSync('../day14.input','utf8')

// Test
// fileContents = "9 ORE => 2 A\n\
// 8 ORE => 3 B\n\
// 7 ORE => 5 C\n\
// 3 A, 4 B => 1 AB\n\
// 5 B, 7 C => 1 BC\n\
// 4 C, 1 A => 1 CA\n\
// 2 AB, 3 BC, 4 CA => 1 FUEL"
// fileContents = "157 ORE => 5 NZVS\n\
// 165 ORE => 6 DCFZ\n\
// 44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL\n\
// 12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ\n\
// 179 ORE => 7 PSHF\n\
// 177 ORE => 5 HKGWZ\n\
// 7 DCFZ, 7 PSHF => 2 XJWVT\n\
// 165 ORE => 2 GPVTF\n\
// 3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT"
// fileContents = "2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG\n\
// 17 NVRVD, 3 JNWZP => 8 VPVL\n\
// 53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL\n\
// 22 VJHF, 37 MNCFX => 5 FWMGM\n\
// 139 ORE => 4 NVRVD\n\
// 144 ORE => 7 JNWZP\n\
// 5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC\n\
// 5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV\n\
// 145 ORE => 6 MNCFX\n\
// 1 NVRVD => 8 CXFTF\n\
// 1 VJHF, 6 MNCFX => 4 RFSQX\n\
// 176 ORE => 6 VJHF"



let lines = fileContents.split("\n")

class Node {
    quantity_produced: number
    reaction_dependencies: [number, string][]
    
    constructor(quantity_produced: number, reaction_dependencies: [number, string][]) {
        this.quantity_produced = quantity_produced
        this.reaction_dependencies = reaction_dependencies.slice()
    }
}

let nodes = new Map<string, Node>()

lines.forEach(l => {
    let deps = l.split("=>")[0]
    let out = l.split("=>")[1]
    let r_deps = deps.match(/([0-9]+) ([A-Z]+)/g)
    let result = out.match(/([0-9]+) ([A-Z]+)/g)
    let dep_nodes: Node[] = []

    if (result == undefined) {
        console.log("line is borked: " + l)
        return
    }

    let quantity_produced = Number(result[0].split(' ')[0])
    let name_result = result[0].split(' ')[1]

    let reaction_dependencies: [number, string][] = []
    for (let i = 0; r_deps != undefined && i < r_deps.length; i++) {
        let cost = Number(r_deps[i].split(' ')[0])
        let name = r_deps[i].split(' ')[1]
        reaction_dependencies.push([cost, name])
    }
    nodes.set(name_result, new Node(quantity_produced, reaction_dependencies))
    console.log("Added Node " + name_result + " quantity_produced: " + quantity_produced + " deps: " + reaction_dependencies)
})

let overproduction = new Map<string, number>()   // Keep track of overproduction available for reuse
let produced = new Map<string, number>()   // Keep track of overproduction available for reuse

function update_inventory(inventory: Map<string, number>, type: string, num_in_use: number) {
    let stock = inventory.get(type)
    if (stock == undefined) {
        inventory.set(type, num_in_use)
    } else {
        inventory.set(type, stock + num_in_use)
    }
}

function produce(quantity: number, type: string) {
    // console.log("Producing " + quantity + " " + type)
    let node = nodes.get(type)
    if (type == "ORE") {
        update_inventory(produced, type, quantity) // Just make it
        return 
    }

    if (node == undefined) {
        console.log("hmm? " + type + " is undefined")
        return
    }

    // Figure out how much to produce
    // Pick as much as we can from overproduction if it exists
    let left_to_produce = quantity
    let in_stock = overproduction.get(type)
    if (in_stock != undefined) {
        left_to_produce = quantity - in_stock
        if (left_to_produce < 0) {  // Took too much from overproduction
            in_stock = left_to_produce * -1 // Return
            left_to_produce = 0
        } else {
            in_stock = 0 // Used everything
        }
        // Update overproduction
        overproduction.set(type, in_stock)
    }

    if (left_to_produce == 0) {
        update_inventory(produced, type, quantity) // Fullfilled production using stock
        // console.log("Fullfilled production using stock for type " + type)
    } else {
        let num_reactions = left_to_produce / node.quantity_produced
        let unused_overproduction = 0
        // Round up
        if (~~num_reactions < num_reactions) {
            num_reactions = ~~num_reactions + 1
            unused_overproduction = node.quantity_produced - (left_to_produce % node.quantity_produced)
        }

        if (unused_overproduction != 0) {
            update_inventory(overproduction, type, unused_overproduction)
        }
        
        // Need to produce this node. Do this by producing children
        for (let [child_cost, child_type] of node.reaction_dependencies) {
            produce(child_cost * num_reactions, child_type)
        }
        
        // Now we are produced
        update_inventory(produced, type, quantity) // Fullfilled production using stock
    }
}

produce(1, "FUEL")
console.log("Part 1: produced 1 fuel with " + produced.get("ORE") + " ORE")

// Part 2, binary search to answer
let fuel_low = 1
let fuel_high = 100_000_000
while(true) {
    let fuel_mid = ~~((fuel_low + fuel_high) / 2)

    // Clean slate
    produced = new Map()
    overproduction = new Map()
    produce(fuel_mid, "FUEL")

    let ore_req = produced.get("ORE")!
    console.log(fuel_mid + " Fuel required " + ore_req + " ore, fuel_low: " + fuel_low + " fuel_mid: " + fuel_mid +  " fuel_high: " + fuel_high)
    if (ore_req > 1000_000_000_000) {
        if (fuel_high == fuel_mid) {
            fuel_low = fuel_mid
        }
        fuel_high = fuel_mid
    } else if (ore_req < 1000_000_000_000) {
        if (fuel_low == fuel_mid) {
            fuel_high = fuel_mid
        }
        fuel_low = fuel_mid
    } else {
        // Exact match
        console.log("Fuel " + fuel_mid + " requiring ore " + ore_req + " is an exact match")
    }

    if (fuel_low == fuel_high) {
        console.log("Fuel " + fuel_mid + " requiring ore " + ore_req + " is the closest we get")
        break;
    }
}