import * as fs from 'fs';

let fileContents = fs.readFileSync('../day04.input','utf8')
const low_range = Number(fileContents.split('-')[0])
const high_range = Number(fileContents.split('-')[1])

function validate(
    val: number, 
    parts_checker: (part: String) => boolean
): boolean {
    let value = String(val)

    // Check ascending
    let varr = value.split('')
    let varr2 = value.split('')
    varr2.sort()
    if (varr.join() != varr2.join()) {
        return false
    }

    // Split similar neighbours into separate parts
    let parts: String[] = []
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        if (parts.length == 0) {
            parts.push(current)
        } else {
            // Add current to top part if it is the same
            if (parts[parts.length - 1][0] == current) {
                parts[parts.length - 1] += current
            } else {
                parts.push(current)
            }
        }
    }

    // Check parts
    return parts.some(parts_checker)
}

let part1: (part: String) => boolean = p => p.length >= 2
let part2: (part: String) => boolean = p => p.length == 2

let valid_sum = 0
let valid_sum2 = 0
for (let i = low_range; i < high_range; i++) {
    valid_sum += validate(i, part1) ? 1 : 0
    valid_sum2 += validate(i, part2) ? 1 : 0
}
console.log("Different valid passwords within range with large groups: " + valid_sum)
console.log("Different valid passwords within range without large groups: " + valid_sum2)