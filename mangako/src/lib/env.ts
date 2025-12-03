import { z } from 'zod';

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // NextAuth
    NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
    NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith('sk_', "STRIPE_SECRET_KEY must start with sk_"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    if (process.env.SKIP_ENV_VALIDATION === "true") {
        console.warn('⚠️ Skipping environment validation due to SKIP_ENV_VALIDATION=true');
        // Return a mock environment that satisfies the schema types but might fail at runtime if used
        return {
            DATABASE_URL: process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock",
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "mock_secret_at_least_32_characters_long_for_validation",
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "sk_test_mock",
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock",
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock_key",
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
            NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
        };
    }

    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`);
            console.error('❌ Invalid environment variables:');
            missingVars.forEach((v: string) => console.error(`  - ${v}`));
            throw new Error('Environment validation failed. Check the errors above.');
        }
        throw error;
    }
}

export const env = validateEnv();
