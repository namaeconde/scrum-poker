'use client'

import { createUser, fetchUserById, updateRoomStatusById, updateUserLastSeenById } from '@/utils/supabase/actions';
import {redirect, useSearchParams} from 'next/navigation';
import { useEffect, useState } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import { useDebounce } from "use-debounce";
import Table from "@/components/table";
import { RoomType } from "@/types/RoomType";
import { UserType } from "@/types/UserType";

const fetchRoom = async (roomId: string | null) => {
    const existingRoom = JSON.parse(sessionStorage.getItem('room') as string);
    if (existingRoom) {
        return existingRoom;
    }

    if (roomId) {
        const result = await updateRoomStatusById(roomId, 'active');
        if (!result.error) {
            sessionStorage.setItem('room', JSON.stringify(result));
            return result;
        }
    }
}

const leaveRoom = () => {
    const existingRoom = JSON.parse(sessionStorage.getItem('room') as string);
    const existingUserId = sessionStorage.getItem('userId');
    if (existingRoom?.id && existingUserId) {
        navigator.sendBeacon(`/api/room/leave?roomId=${existingRoom.id}&userId=${existingUserId}`);
    }
}

const fetchUser = async () => {
    const existingUserId = sessionStorage.getItem('userId');
    if (existingUserId) {
        return await fetchUserById(existingUserId);
    }

    return null;
}

export default function Room() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [room, setRoom] = useState<RoomType>();
    const [username, setUsername] = useState<string>();
    const [user, setUser] = useState<UserType>();
    const [debouncedUsername] = useDebounce(username, 500);

    let userLastSeenInterval: NodeJS.Timeout;

    const handleCreateUser = async () => {
        if (debouncedUsername && room?.id) {
            const newValue = await createUser(debouncedUsername, room.id);
            sessionStorage.setItem('userId', newValue.id as string);
            setUser(newValue);
            // Update user last seen every 10 seconds
            userLastSeenInterval = setInterval(async () => {
                await updateUserLastSeenById(newValue.id);
            }, 10000);
        }
    }

    useEffect(() => {
        (async () => {
            if (!room) {
                const result = await fetchRoom(roomId);
                if (result) setRoom(result);
            }

            if (!user) {
                const result = await fetchUser();
                if (result) {
                    setUser(result);
                    // Update user last seen every 10 seconds
                    userLastSeenInterval = setInterval(async () => {
                        await updateUserLastSeenById(result.id);
                    }, 10000);
                }
            }
            setIsLoading(false);
        })();

        return () => {
            clearInterval(userLastSeenInterval);
        }

    }, [room]);

    return (
        isLoading ? <div>Loading...</div> :
            room ? user ? <Table room={room} currentUser={user} /> :
                <div className="p-4 sm:p-5 sm:w-auto shadow-md inset-shadow-sm">
                    <div className="flex gap-4 items-center flex-col">
                        <Input label="Input your username"
                               defaultValue=""
                               onChange={(e) => {
                                   setUsername(e.target.value)
                               }}
                               onKeyDown={(e) => {
                                   if (e.code === 'Enter') {
                                       handleCreateUser();
                                   }
                               }}
                        />
                        <div className="flex gap-2">
                            <Button text="Cancel" onClick={() => leaveRoom()}/>
                            <Button text="Submit" isDisabled={!username} onClick={() => handleCreateUser()}/>
                        </div>
                    </div>
                </div> :
                <div className="flex gap-4 items-center flex-col">
                    <span>Room does not exists</span>
                    <Button text="Back" onClick={() => redirect("/")}/>
                </div>
    )
}