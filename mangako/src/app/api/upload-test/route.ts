import { NextResponse } from 'next/server'
import { writeFile, mkdir, access, unlink } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'

export async function GET() {
    try {
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        const testFilename = `test-${Date.now()}.txt`
        const testFilePath = join(uploadDir, testFilename)

        // Try to create directory
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Directory might already exist
        }

        // Test write permissions
        try {
            await writeFile(testFilePath, 'test')

            // Clean up test file
            try {
                await unlink(testFilePath)
            } catch (e) {
                // Ignore cleanup errors
            }

            return NextResponse.json({
                canWrite: true,
                uploadDir,
                message: 'Local storage is writable'
            })
        } catch (writeError) {
            return NextResponse.json({
                canWrite: false,
                uploadDir,
                error: writeError instanceof Error ? writeError.message : 'Unknown error',
                message: 'Cannot write to uploads directory'
            })
        }
    } catch (error) {
        return NextResponse.json({
            canWrite: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to test local storage'
        }, { status: 500 })
    }
}
