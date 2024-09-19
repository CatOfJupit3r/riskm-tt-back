import DatabaseService from '@services/DatabaseService'
import { server } from '@graphql/apollo'
import { SERVER_HOST, SERVER_PORT } from './configs'

const run = async () => {
    await DatabaseService.init()

    const { url } = await server.listen({
        path: `${SERVER_HOST}:${SERVER_PORT}`,
    })
    console.log(`Server ready at ${url}`)
}

export default run