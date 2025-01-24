import { UserLogin } from "./auth.interface"

declare global {
    namespace Express {
        export interface Request {
            user?: UserLogin
        }
    }
}

