import { configDotenv } from 'dotenv'


configDotenv({
    'path': '.env',
})

export const SERVER_PORT = process.env.SERVER_PORT as string
export const MONGO_URL = process.env.MONGO_URL as string
export const HYDRATION_MODE: 'TEST' | 'PRODUCTION' | 'DEVELOPMENT' | string | undefined = process.env.HYDRATION_MODE

if (!SERVER_PORT) {
    throw new Error('SERVER_PORT is not provided')
}
if (!MONGO_URL) {
    throw new Error('MONGO_URL is not provided')
}
