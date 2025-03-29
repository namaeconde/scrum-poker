import { updateRoomStatusById } from "@/utils/supabase/actions";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    // TODO: Update id to userid
    const id = searchParams.get('id');

    // TODO: Delete user in users table
    // TODO: Update room status to 'inactive' if there are no users in the room
    if (id) await updateRoomStatusById(id, 'inactive');

    const roomInfo = { id: Date.now(), room_id: id };
    return new Response(JSON.stringify(roomInfo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}