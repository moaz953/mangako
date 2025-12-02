/**
 * Retry utility for file uploads with exponential backoff
 */

export interface RetryOptions {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
}

export interface RetryResult<T> {
    success: boolean
    data?: T
    error?: string
    attempts: number
}

const defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
    const errorType = error?.errorType
    const errorMessage = error?.error || error?.message || ''

    // Don't retry validation errors (file too large, wrong type, etc.)
    if (errorType === 'validation') {
        return false
    }

    // Don't retry permanent storage errors
    if (errorMessage.includes('bucket not found') ||
        errorMessage.includes('Permission denied')) {
        return false
    }

    // Retry network errors, temporary failures, etc.
    if (errorType === 'network' ||
        errorType === 'supabase' ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection')) {
        return true
    }

    // By default, retry unknown errors
    return errorType === 'unknown' || !errorType
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise with result
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const opts = { ...defaultOptions, ...options }
    let lastError: any
    let delay = opts.initialDelay

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
        try {
            const result = await fn()
            return {
                success: true,
                data: result,
                attempts: attempt
            }
        } catch (error) {
            lastError = error

            // Don't retry if this is the last attempt or error is not retryable
            if (attempt >= opts.maxRetries + 1 || !isRetryableError(error)) {
                break
            }

            // Wait before retrying
            await sleep(delay)

            // Increase delay for next retry (exponential backoff)
            delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay)
        }
    }

    return {
        success: false,
        error: lastError?.error || lastError?.message || 'Unknown error',
        attempts: opts.maxRetries + 1
    }
}

/**
 * Retry a file upload specifically
 */
export async function retryFileUpload(
    uploadFn: () => Promise<any>,
    options: RetryOptions = {}
): Promise<RetryResult<{ url: string }>> {
    return retryWithBackoff(async () => {
        const result = await uploadFn()

        if (!result.success) {
            // Throw error to trigger retry
            throw result
        }

        return { url: result.url }
    }, options)
}
