type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: Record<string, unknown>
    error?: {
        name: string
        message: string
        stack?: string
    }
    userId?: string
}

class Logger {
    private log(
        level: LogLevel,
        message: string,
        context?: Record<string, unknown>,
        error?: Error
    ) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            } : undefined
        }

        // Console output (always in development)
        if (process.env.NODE_ENV === 'development') {
            const emoji = {
                info: 'ℹ️',
                warn: '⚠️',
                error: '❌',
                debug: '🐛'
            }[level]

            console[level === 'error' ? 'error' : 'log'](
                `${emoji} [${entry.timestamp}] ${level.toUpperCase()}: ${message}`,
                context || '',
                error || ''
            )
        }

        // Production: Log to external service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to monitoring service
            // Options:
            // - Sentry: Sentry.captureException(error, { contexts: { custom: context } })
            // - LogRocket: LogRocket.captureException(error, { tags: context })
            // - DataDog: datadogLogger.error(message, { error, ...context })
            // - Custom endpoint: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })

            // For now, still log to console in production
            if (level === 'error') {
                console.error(message, error, context)
            }
        }
    }

    /**
     * Log informational message
     * @example logger.info('User logged in', { userId: '123' })
     */
    info(message: string, context?: Record<string, unknown>) {
        this.log('info', message, context)
    }

    /**
     * Log warning message
     * @example logger.warn('API rate limit approaching', { remaining: 10 })
     */
    warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', message, context)
    }

    /**
     * Log error with optional Error object and context
     * @example logger.error('Failed to create user', error, { email: 'test@example.com' })
     */
    error(message: string, error?: Error, context?: Record<string, unknown>) {
        this.log('error', message, context, error)
    }

    /**
     * Log debug message (only in development)
     * @example logger.debug('Query result', { rows: 5, duration: '23ms' })
     */
    debug(message: string, context?: Record<string, unknown>) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, context)
        }
    }

    /**
     * Create a child logger with default context
     * @example const dbLogger = logger.child({ component: 'database' })
     */
    child(defaultContext: Record<string, unknown>) {
        return {
            info: (msg: string, ctx?: Record<string, unknown>) =>
                this.info(msg, { ...defaultContext, ...ctx }),
            warn: (msg: string, ctx?: Record<string, unknown>) =>
                this.warn(msg, { ...defaultContext, ...ctx }),
            error: (msg: string, err?: Error, ctx?: Record<string, unknown>) =>
                this.error(msg, err, { ...defaultContext, ...ctx }),
            debug: (msg: string, ctx?: Record<string, unknown>) =>
                this.debug(msg, { ...defaultContext, ...ctx }),
        }
    }
}

// Export singleton instance
export const logger = new Logger()

// Export types for external use
export type { LogLevel, LogEntry }
