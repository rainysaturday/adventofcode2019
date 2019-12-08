import * as fs from 'fs';

let fileContents = fs.readFileSync('../day08.input','utf8')

const width = 25
const height = 6
const layer_length = width * height

const layers: String[] = []

for (let line of fileContents.split("\n")) {
    if (line.length % layer_length == 0 && line.length > 0) {
        for (let pos = 0; pos < line.length; pos = pos + layer_length) {
            let new_layer = line.substring(pos, pos + layer_length)
            if (new_layer.length == layer_length) {
                layers.push(new_layer)
            } else {
                console.log("bad layer '" + new_layer + "'")
            }
        }
    }
}
console.log("Created " + layers.length + " layers")

// Part 1, number of 1 multiplied by number of 2 on layer with fewest 0
let p1fewest: String = ""
let p1zero_count = undefined
for (let l of layers) {
    let zero_count = l.split('').filter(c => c == '0').length
    if (p1zero_count == undefined || p1zero_count > zero_count) {
        p1fewest = l
        p1zero_count = zero_count
    }
}

let ones = p1fewest.split('').filter(c => c == '1').length
let twos = p1fewest.split('').filter(c => c == '2').length
console.log("1 multiplied by 2s = " + (ones * twos))

// Part 2 render
for (let y = 0; y < height; y++) {
    let line = ""
    for (let x = 0; x < width; x++) {
        let pos = (y*width) + x
        let color = '2'   // Start with transparent
        for (let l of layers) {
            if (l[pos] != '2') {
                color = l[pos]
                break
            }
        }
        if (color != '1') {
            line += ' '
        } else {
            line += color
        }
    }
    console.log(line)
}