import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"
import { appendFile } from "fs/promises"
import { join } from "path"

const LOG_FILE = join(process.cwd(), "server-debug.log")

async function log(message: string) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [AUTH] ${message}\n`
    try {
        await appendFile(LOG_FILE, logMessage)
    } catch (e) {
        console.error("Failed to write to log file", e)
    }
}

export async function getSession() {
    // Ensure cookies are available for Server Actions
    await cookies() // This ensures cookies are read
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    const session = await getSession()
    logger.info("getCurrentUser called", {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
    })
    return session?.user
}

/**
 * Require the user to be authenticated.
 * Throws an error if not authenticated.
 */
export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        logger.warn("Unauthenticated access attempt")
        await log("requireAuth failed: No user found in session")
        throw new Error("Unauthorized: You must be logged in")
    }

    return user
}

/**
 * Require the user to have admin role.
 * Throws an error if not authenticated or not an admin.
 */
export async function requireAdmin() {
    const user = await requireAuth()

    if (user.role !== "admin") {
        logger.warn("Unauthorized admin access attempt", { userId: user.id, role: user.role })
        await log(`requireAdmin failed: User ${user.id} has role '${user.role}', expected 'admin'`)
        throw new Error("Forbidden: You do not have permission to perform this action")
    }

    return user
}

/**
 * Check if the current user is the owner of a resource or an admin.
 */
export async function requireOwnerOrAdmin(ownerId: string) {
    const user = await requireAuth()

    if (user.role !== "admin" && user.id !== ownerId) {
        logger.warn("Unauthorized resource access attempt", { userId: user.id, ownerId })
        throw new Error("Forbidden: You do not have permission to access this resource")
    }

    return user
}
