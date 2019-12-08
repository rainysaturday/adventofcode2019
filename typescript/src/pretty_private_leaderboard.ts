import * as fs from 'fs';

let fileContents = fs.readFileSync('../leaderboard_json2','utf8')

class Contender {
    public name: String
    public star_ts: number
    public constructor(name: String, star_ts: number) {
        this.name = name
        this.star_ts = star_ts
    }
}

let leaderboard = JSON.parse(fileContents)
let members = leaderboard.members
members = Object.values(members)

function get_members_for_star(day: number, star: number): Contender[] {
    let contenders: Contender[] = []

    for (let member of members) {
        let completed_day = member.completion_day_level[String(day)]
        if (completed_day != undefined) {
            let completed_star = completed_day[String(star)]
            if (completed_star != undefined) {
                let name = member.name == null ? "#" + member.id + "" : member.name
                contenders.push(new Contender(
                    name,
                    completed_star.get_star_ts
                ))
            }
        }
    }

    return contenders
}

let columns: Array<String[]>
for (let day = 1; day <= 25; day++) {
    for (let star = 1; star <= 2; star++) {
        let contenders = get_members_for_star(day, star)
        contenders.sort((a, b) => a.star_ts - b.star_ts)
        let contender_render = ""
        for (let i = 0; i < contenders.length; i++) {
            contender_render += contenders[i].name.substring(0, 4)
            contender_render += " "
            if (i > 0) {
                let diff = "+" + (contenders[i].star_ts - contenders[i-1].star_ts)
                diff = diff.padStart(8, " ")
                contender_render += diff
            }
            contender_render += " | "
        }
        console.log("Day-Star: " + String(day + "-" + star).padStart(4, " ") + ": " + contender_render)
    }
}
