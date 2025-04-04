'use client'

import { createUser, fetchUserById, updateRoomStatusById } from '@/utils/supabase/actions';
import { useSearchParams } from 'next/navigation';
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
        const newRoom = await updateRoomStatusById(roomId, 'active');
        sessionStorage.setItem('room', JSON.stringify(newRoom));
        return newRoom;
    }
}

const leaveRoom = () => {
    if (document.visibilityState === "hidden" && sessionStorage.getItem('isClosing') === 'true') {
        const existingRoom = JSON.parse(sessionStorage.getItem('room') as string);
        const existingUserId = sessionStorage.getItem('userId');
        navigator.sendBeacon(`/api/room/leave?id=${existingRoom?.id}`, JSON.stringify({ userId: existingUserId}));
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
                const room = await fetchRoom(roomId);
                setRoom(room);
            }

            const user = await fetchUser();
            setUser(user);
            setIsLoading(false);
        })();

        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            sessionStorage.setItem('isClosing', 'true');
            setTimeout(() => {
                sessionStorage.removeItem('isClosing');
            }, 1000); // Slight delay to ensure the flag is cleared on refresh
        });

        document.onvisibilitychange = () => {
            leaveRoom();
        };
    }, [room]);

    return (
        isLoading ? <div>Loading...</div> :
            room && user ? <Table room={room} currentUser={user} /> :
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
                </div>
    )
}