import _ from 'lodash'

async function main() {
  console.log(`Hello world!`)
}

main().catch(_ => {
  console.error(_);
  process.exit(1)
})
