import { updateRoomStatusById } from "@/utils/supabase/actions";
import {NextRequest} from "next/server";

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (id) await updateRoomStatusById(id, 'inactive');

    const roomInfo = { id: Date.now(), room_id: id };
    return new Response(JSON.stringify(roomInfo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}