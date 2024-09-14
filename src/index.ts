const run = async () => {
    // await DatabaseService.connect()
    // console.log('Connected to database')
    // try {
    //     await DatabaseService.addTestMocks()
    //     console.log('Added test mocks successfully')
    // } catch (error) {
    //     console.error('Failed to add test mocks:', error)
    // }
    process.exit()
}

run().then(
    () => console.log('Done'),
    error => console.error('Failed to run:', error),
)
