import DatabaseService from '@services/DatabaseService'
import { server } from '@graphql/apollo'
import { SERVER_HOST, SERVER_PORT } from './configs'

const run = async () => {
    await DatabaseService.init()

    const { url } = await server.listen(SERVER_PORT, SERVER_HOST)
    console.log(`Server ready at ${url}`)
}

export default run
