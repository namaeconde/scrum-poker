import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
)

export const createChannel = (channelName: string) => {
    return supabaseClient.channel(channelName)
}