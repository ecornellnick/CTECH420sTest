require('dotenv').config()
import codio from 'codio-api-js'
import _ from 'lodash'
const api = codio.v1

const clientId = process.env['CLIENT'] || 'clientId'
const secret = process.env['SECRET'] || 'secret'

// hardcoded values
const courseId = 'courseId'
const studentEmail = 'student@email.com'
const multiplier = 1.5

async function main() {
  await api.auth(clientId, secret)

  const students = await api.course.getStudents(courseId)

  const student = _.find(students, {email: studentEmail})
  if (_.isUndefined(student)) {
      throw new Error(`${studentEmail} student not found`)
  }
  const course = await api.course.info(courseId)
  for (const module of course.modules) {
    console.log(`${module.name} :`)
    for (const assignment of module.assignments) {
      if (assignment.name.includes('Quiz') || assignment.name.includes('Exam')) {
        console.log(`${assignment.name} :`)
        const settings = await api.assignment.getSettings(courseId, assignment.id)
        console.log(`${settings.examMode?.timedExamMode?.enabled} :`)
        if (settings.examMode?.timedExamMode?.enabled){
          const timeLimit = settings.examMode.timedExamMode.duration * multiplier
          console.log(`Extending ${assignment.name} from ${settings.examMode.timedExamMode.duration} minutes to ${timeLimit} minutes for student ${student.name}`)
          const extension = timeLimit - settings.examMode.timedExamMode.duration
          await api.assignment.updateStudentTimeExtension(courseId, assignment.id, student.id, {
              extendedTimeLimit: extension
          })
        }
      }
    }
  }
}

main().catch(_ => {
  console.error(_);
  process.exit(1)
})
