require('dotenv').config()
import codio from 'codio-api-js'
import { Assignment } from 'codio-api-js/lib/lib/course'
import _ from 'lodash'
const api = codio.v1

const clientId = process.env['CLIENT'] || 'clientId'
const secret = process.env['SECRET'] || 'secret'

// hardcoded values
const courseId = 'courseId'
const studentEmail = 'student@email.com'
let moduleName = 'module name'
let assignmentNames = 'assignment 1,assignment 2'
let shiftDays = 2
let shiftHours = 12
let shiftMinutes = 30

async function main() {
  await api.auth(clientId, secret)
  
  const assignments = _.compact(assignmentNames.split(','))
  const students = await api.course.getStudents(courseId)

  const student = _.find(students, {email: studentEmail})
  if (_.isUndefined(student)) {
      throw new Error(`${studentEmail} student not found`)
  }
  const course = await api.course.info(courseId)
  const toExtend: Assignment[] = []
  for (const module of course.modules) {
    if (module.name === moduleName) {
      toExtend.push.apply(module.assignments)
      continue
    }
    for (const assignment of module.assignments) {
      if (assignments.includes(assignment.name)) {
        toExtend.push(assignment)
      }
    }
  }

  const extend = shiftDays * 24 * 60 + shiftHours * 60 + shiftMinutes

  for(const assignment of toExtend) {
    console.log(`Extending ${assignment.name} for ${student.name} by ${extend} minutes`)
    await api.assignment.updateStudentTimeExtension(courseId, assignment.id, student.id, {
        extendedDeadline: extend
    })
  }
}

main().catch(_ => {
  console.error(_);
  process.exit(1)
})
