import { deleteUserById, fetchUsersByRoomId, updateRoomStatusById } from "@/utils/supabase/actions";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');

    if (userId) await deleteUserById(userId);
    if (roomId) {
        const users = await fetchUsersByRoomId(roomId);
        if (users?.length == 0) {
            await updateRoomStatusById(roomId, 'inactive');
        }
    }

    const roomInfo = { id: Date.now(), room_id: roomId };
    return new Response(JSON.stringify(roomInfo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}