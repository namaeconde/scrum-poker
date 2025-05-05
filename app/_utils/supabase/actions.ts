'use server'

import { supabaseClient } from "@/utils/supabase/client";

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

export const deleteRoomsByIds = async (ids: string[]) => {
    await supabaseClient.from("rooms")
        .delete()
        .in('id', ids);
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

export const deleteUsersByIds = async (ids: string[]) => {
    const { error: deleteError } = await supabaseClient.from("users")
        .delete()
        .in('id', ids);

    if (deleteError) throw new Error(deleteError.message)

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