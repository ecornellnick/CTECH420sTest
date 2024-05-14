require('dotenv').config()
import {v1 as api} from 'codio-api-js'
import _ from 'lodash'

const clientId = process.env['CLIENT'] || 'clientId'
const secret = process.env['SECRET'] || 'secret'

// hardcoded values
let courseId = 'courseId'
let snowDayStart = new Date('yyyy-mm-ddThh:mm:ss')
let snowDayStop = new Date('yyyy-mm-ddThh:mm:ss')
let shiftDays = 3
let shiftHours = 0
let shiftMinutes = 0

function adjustDate(date: Date): boolean {
  if (date < snowDayStop && date > snowDayStart) {
    date.setDate(date.getDate() + shiftDays)
    date.setHours(date.getHours() + shiftHours)
    date.setMinutes(date.getMinutes() + shiftMinutes)
    return true
  }
  return false
}

async function main() {
  await api.auth(clientId, secret)

  const course = await api.course.info(courseId)
  for (const assignment of course.assignments) {
    const settings = await api.assignment.getSettings(courseId, assignment.id)
    if (!settings.endTime) {
      continue
    }
    let modified = adjustDate(settings.endTime)
    const penalties = settings.penalties || []
    for (const penalty of penalties) {
      if (!penalty.datetime) {
        continue
      }
      modified = adjustDate(penalty.datetime) || modified
    }
    if (modified) {
      console.log(`Updating ${assignment.id}`, settings)
      await api.assignment.updateSettings(courseId, assignment.id, settings)
    }
  }
}

main().catch(_ => {
  console.error(_);
  process.exit(1)
})
