'use server'

import { supabaseClient } from "@/utils/supabase/client";
import { CronJob } from "cron";
import { CLEANUP_ROOMS_CRON_TIME } from "@/utils/Constants";

export const createRoom = async () => {
    const { data: rooms, error } = await supabaseClient.from("rooms")
        .upsert({})
        .select();
    console.log(error);
    return rooms && rooms?.length > 0 ? rooms.at(0) : { error: "Room doesn't exists" };
}

export const updateRoomStatusById = async (id: string, status: 'active' | 'inactive') => {
    const { data: rooms, error } = await supabaseClient.from("rooms")
        .update({ id, status })
        .eq('id', id)
        .select();

    console.log(error);
    return rooms && rooms?.length > 0 ? rooms.at(0) : { error: "Room doesn't exists" };
}

export const fetchUsersByRoomId = async (roomId: string) => {
    const { data: users } = await supabaseClient.from("users")
    .select()
    .eq('room_id', roomId);
    return users;
}

export const deleteUserById = async (id: string) => {
    await supabaseClient.from("users")
    .delete()
    .eq('id', id);
}

const cleanupInactiveRooms = new CronJob(CLEANUP_ROOMS_CRON_TIME, async() => {
    await supabaseClient.from("rooms")
        .delete()
        .eq('status', 'inactive')
})

if (!cleanupInactiveRooms.isActive) {
    cleanupInactiveRooms.start();
}