import DatabaseService from '@services/DatabaseService'
import { server } from '@graphql/apollo'
import { SERVER_PORT } from './configs'

const run = async () => {
    await DatabaseService.init()

    const { url } = await server.listen({
        port: SERVER_PORT,
    })
    console.log(`Server ready at ${url}`)
}

export default run