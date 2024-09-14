import DatabaseService from '@services/DatabaseService'
import { server } from './graphql/apollo'
import { SERVER_PORT } from './configs'

const run = async () => {
    /*
        Uncomment the following code to hydrate the database with test mocks

        You can replace the `addTestMocks` with `addProdMocks`, after which database will have as much data as is expected in production
        (Useful when you need speed metrics!)

        // await DatabaseService.connect()
        // console.log('Connected to database')
        // try {
        //     await DatabaseService.addTestMocks()
        //     console.log('Added test mocks successfully')
        // } catch (error) {
        //     console.error('Failed to add test mocks:', error)
        // }
     */
    await DatabaseService.connect()

    const { url } = await server.listen({
        port: SERVER_PORT,
    })
    console.log(`Server ready at ${url}`)
}

export default run