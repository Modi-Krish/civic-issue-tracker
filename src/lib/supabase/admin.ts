import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client – uses the service role key.
 * NEVER expose this client on the browser side.
 * Only import this in server-side code (API routes, Server Actions, etc.)
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
