'use client'

import { createUser, fetchUserById, updateRoomStatusById } from '@/utils/supabase/actions';
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from "react";
import InputComponent from "@/components/input/input.component";
import ButtonComponent from "@/components/button/button.component";
import { useDebounce } from "use-debounce";
import TableTopComponent from "@/components/table-top/table-top.component";
import { RoomType } from "@/types/RoomType";
import { UserType } from "@/types/UserType";
import { DEBOUNCE_DELAY } from "@/utils/Constants";

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

const LoadRoom = () => {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [room, setRoom] = useState<RoomType>();
    const [username, setUsername] = useState<string>();
    const [user, setUser] = useState<UserType>();
    const [debouncedUsername] = useDebounce(username, DEBOUNCE_DELAY);

    const handleCreateUser = async () => {
        if (debouncedUsername && room?.id) {
            const newValue = await createUser(debouncedUsername, room.id);
            sessionStorage.setItem('userId', newValue.id as string);
            setUser(newValue);
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
                }
            }

            if (isLoading) {
                setIsLoading(false);
            }
        })();

    }, [room]);

    return (
        <>
            {isLoading && <div>Loading...</div>}
            {!room &&
                <div className="flex gap-4 items-center flex-col">
                    <span>Room does not exists</span>
                    <ButtonComponent text="Back" onClick={() => redirect("/")}/>
                </div>
            }
            {room && !user &&
                <div className="p-4 sm:p-5 sm:w-auto shadow-md inset-shadow-sm">
                    <div className="flex gap-4 items-center flex-col">
                        <InputComponent label="Enter your username"
                                        defaultValue=""
                                        onChange={(e) => {
                                            setUsername(e.target.value)
                                        }}
                                        onKeyDown={ async (e) => {
                                            if (e.code === 'Enter') {
                                                await handleCreateUser();
                                            }
                                        }}
                        />
                        <div className="flex gap-2">
                            <ButtonComponent text="Cancel" onClick={() => leaveRoom()}/>
                            <ButtonComponent text="Submit" isDisabled={!username} onClick={() => handleCreateUser()}/>
                        </div>
                    </div>
                </div>
            }
            {room && user && <TableTopComponent room={room} currentUser={user}/>}
        </>
    )
}

export default function Room() {
    return (
        <Suspense fallback={null}>
            <LoadRoom />
        </Suspense>
    )
}