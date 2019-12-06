import * as fs from 'fs';

let fileContents = fs.readFileSync('../day06.input','utf8')

// Test
// fileContents = "COM)B\n\
// B)C\n\
// C)D\n\
// D)E\n\
// E)F\n\
// B)G\n\
// G)H\n\
// D)I\n\
// E)J\n\
// J)K\n\
// K)L"
// fileContents = "COM)B\n\
// B)C\n\
// C)D\n\
// D)E\n\
// E)F\n\
// B)G\n\
// G)H\n\
// D)I\n\
// E)J\n\
// J)K\n\
// K)L\n\
// K)YOU\n\
// I)SAN"

let lines = fileContents.split("\n")

class Node {
    public name: String
    public parent: Node | undefined
    public children: Node[]

    public constructor(name: String, parent: Node | undefined) {
        this.name = name
        this.parent = parent
        this.children = []
    }

    // Return undefined if for_this does not exist with children, otherwise the count
    public search_children(for_this: Node): number | undefined {
        if (for_this.name == this.name) {
            return 0
        } else {
            for (let child of this.children) {
                let res = child.search_children(for_this)
                if (res != undefined) {
                    return res + 1
                }
            }
        }
        return undefined
    }

    public toString(): String {
        return this.name + " [" + this.children + "]"
    }
}

let node_map = new Map<String, Node>()

function get_node(node_name: String): Node {
    let node = node_map.get(node_name)
    if (!node) {
        node = new Node(node_name, undefined)
    }
    return node
}

// Create all nodes
for (let line of lines) {
    if (line == "") {
        continue
    }
    let [center, orbits] = line.split(")")
    if (center == "" || orbits == "") {
        console.log("bad line: " + line)
    }
    let center_node = get_node(center)
    let orbits_node = get_node(orbits)
    orbits_node.parent = center_node
    center_node.children.push(orbits_node)
    node_map.set(center, center_node)
    node_map.set(orbits, orbits_node)
}

function count_total_direct_indirect_orbits(node: Node): number {
    if (node.parent == undefined) {
        return 0
    } else {
        return count_total_direct_indirect_orbits(node.parent) + 1
    }
}


// Sanity check, should only be one tree, not a forest. also count total_direct_indirect_orbits
let root_count = 0
let COM_node = undefined
let total_direct_indirect_orbits = 0
for (let n of node_map.values()) {
    if (n.parent == undefined) {
        root_count++
        COM_node = n
    } else {
        total_direct_indirect_orbits += count_total_direct_indirect_orbits(n)
    }
}
if (root_count > 1) {
    console.log("Bad tree? we have a forest instead. " + root_count + " different roots")
}

// Part 1, count total direct and indirect orbits
console.log("Total indirect and direct orbits in the tree is " + total_direct_indirect_orbits)

// Part 2 orbits to SAN
let SAN_node = node_map.get("SAN")
let current_node = node_map.get("YOU")
let transfers = 0
while (current_node && SAN_node) {
    let search = current_node.search_children(SAN_node)
    if (search != undefined) {
        // -2 since (transfer + search) will be total edge count between, but the first and last orbit is YOU and SAN orbits so they don't count as transfers
        console.log("Transfers required: " + (transfers + search - 2))
        break
    } else {
        current_node = current_node.parent
        transfers++
    }
}