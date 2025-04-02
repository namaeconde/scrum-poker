import { deleteUserById, updateRoomStatusById } from "@/utils/supabase/actions";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('id');

    const body = await request.text();
    const data = JSON.parse(body);
    if (data && data?.userId) {
        await deleteUserById(data?.userId);
    }

    if (roomId) await updateRoomStatusById(roomId, 'inactive');

    const roomInfo = { id: Date.now(), room_id: roomId };
    return new Response(JSON.stringify(roomInfo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}