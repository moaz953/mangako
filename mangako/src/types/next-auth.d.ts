import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        role: string
        coins: number
    }

    interface Session {
        user: {
            id: string
            role: string
            coins: number
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        id: string
        coins: number
    }
}
