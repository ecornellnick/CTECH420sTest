require('dotenv').config()
import codio from 'codio-api-js'
import _ from 'lodash'
const api = codio.v1

const clientId = process.env['CLIENT'] || 'clientId'
const secret = process.env['SECRET'] || 'secret'

// hardcoded values
const courseId = 'courseId'
const studentEmail = 'student@email.com'
let startOfRange = new Date('yyyy-mm-ddThh:mm:ss')
let endOfRange = new Date('yyyy-mm-ddThh:mm:ss')
let newDeadLine = new Date('yyyy-mm-ddThh:mm:ss')

async function main() {
  await api.auth(clientId, secret)
  const students = await api.course.getStudents(courseId)

  const student = _.find(students, {email: studentEmail})
  if (_.isUndefined(student)) {
      throw new Error(`${studentEmail} student not found`)
  }
  const course = await api.course.info(courseId)

  for (const assignment of course.assignments) {
    const settings = await api.assignment.getSettings(courseId, assignment.id)
    if (!settings.endTime) {
      continue
    }
    if (settings.endTime < endOfRange && settings.endTime > startOfRange) {
      const extension = Math.round((newDeadLine.getTime() - settings.endTime.getTime()) / (1000 * 60))
      console.log(`Adjusting ${assignment.name} for ${student.name} by adding ${extension} minutes`)
      await api.assignment.updateStudentTimeExtension(courseId, assignment.id, student.id, {
        extendedDeadline: extension
      })
    }
  }
}

main().catch(_ => {
  console.error(_);
  process.exit(1)
})
