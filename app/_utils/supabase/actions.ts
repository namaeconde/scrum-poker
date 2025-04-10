'use server'

import { supabaseClient } from "@/utils/supabase/client";
import { CronJob } from 'cron';
import { sub } from "date-fns/sub";

export const createRoom = async () => {
    const { data: rooms, error } = await supabaseClient.from("rooms")
        .upsert({})
        .select();
    console.log(error);
    return rooms && rooms?.length > 0 ? rooms.at(0) : { error: "Room doesn't exists" };
}

export const fetchRoomById = async (id: string) => {
    const { data: rooms } = await supabaseClient.from("rooms")
        .select()
        .eq('id', id);
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

export const deleteRoomById = async (id: string) => {
    await supabaseClient.from("rooms")
        .delete()
        .eq('id', id);
}

export const createUser = async (username: string, roomId: string) => {
    const { data: users, error } = await supabaseClient.from("users")
        .upsert({
            username,
            room_id: roomId,
            last_seen: new Date().toLocaleString()
        })
        .select();

    console.log(error);
    return users && users?.length > 0 ? users.at(0) : null;
}

export const fetchUserById = async (id: string) => {
    const { data: users } = await supabaseClient.from("users")
        .select()
        .eq('id', id);

    return users && users?.length > 0 ? users.at(0) : null;
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

export const updateUserLastSeenById = async (id: string) => {
    const currentTime = new Date().toLocaleString();
    const { data: users, error } = await supabaseClient.from("users")
        .update({ last_seen: currentTime })
        .eq('id', id)
        .select();

    console.log(error);
    return users && users?.length > 0 ? users.at(0) : null;
}

// Cron job that runs every 2 minutes
// To clean up users last seen 5 minutes ago
const cleanInactiveUsersCronJob = new CronJob('*/2 * * * *', async() => {
    const fiveMinutesAgo = sub(new Date(), { minutes: 5 }).toLocaleString();
    const { data: inactiveUsers, error } = await supabaseClient.from("users")
        .select()
        .lt('last_seen', fiveMinutesAgo);

    if (error) {
        throw new Error(error.message);
    }

    console.log(`Cleaning ${inactiveUsers?.length} inactive users`);
    console.log(`Users last seen less than ${fiveMinutesAgo} minutes ago`);
    if (inactiveUsers && inactiveUsers?.length > 0) {
        const { error: deleteError } = await supabaseClient.from("users")
            .delete()
            .in('id', inactiveUsers.map(user => user.id));

        if (deleteError) {
            throw new Error(deleteError.message);
        }
    }
})

if (!cleanInactiveUsersCronJob.isActive) {
    cleanInactiveUsersCronJob.start();
}