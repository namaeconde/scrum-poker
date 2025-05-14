import { createClient } from '@supabase/supabase-js';
import { REALTIME_LISTEN_TYPES, REALTIME_PRESENCE_LISTEN_EVENTS } from "@supabase/realtime-js";
import { updateRoomStatusById } from "@/utils/supabase/actions";

export const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
)

export const createChannel = (channelName: string, roomId: string) => {
    const channel = supabaseClient.channel(channelName);
    channel.on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC }, async () => {
        const newState = channel.presenceState()
        if (Object.values(newState).length === 0) {
            await updateRoomStatusById(roomId, "inactive");
        } else {
            await updateRoomStatusById(roomId, "active");
        }
    })
    return channel;
}