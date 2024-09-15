import { AuthenticationError, UserInputError } from 'apollo-server'


const BadRequest = (message: string) => {
    return new UserInputError(message)
}

const Unauthorized = (message?: string) => {
    return new AuthenticationError(message || 'Unauthorized')
}

export {
    BadRequest,
    Unauthorized,
}