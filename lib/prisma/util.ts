import { Prisma } from '@prisma/client';

/**
 * A utility function to wrap Prisma operations with a retry mechanism.
 * This is useful for handling transient database connection errors in serverless environments.
 * 
 * @param operation The Prisma operation to execute (e.g., () => prisma.user.findUnique(...)).
 * @param retries The number of times to retry the operation.
 * @param delay The delay between retries in milliseconds.
 * @returns The result of the Prisma operation.
 */
export async function withPrismaRetry<T>(
    operation: () => Promise<T>,
    { retries = 3, delay = 1500 } = {}
): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            let errorCode = 'UNKNOWN';
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                errorCode = error.code;
            }
            // Log a warning, but don't fail the request yet
            console.warn(`Prisma operation failed. Attempt ${i + 1} of ${retries}. Retrying in ${delay}ms...`, errorCode);
            // Wait for the specified delay before trying again
            await new Promise(res => setTimeout(res, delay));
        }
    }
    
    // If all retries fail, log a critical error and throw the last error caught
    console.error(`💀 Prisma operation failed after ${retries} retries.`);
    throw lastError;
}