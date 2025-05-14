'use client'

import { updateRoomStatusById } from '@/utils/supabase/actions';
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from "react";
import InputComponent from "@/components/input/input.component";
import ButtonComponent from "@/components/button/button.component";
import { useDebounce } from "use-debounce";
import TableTopComponent from "@/components/table-top/table-top.component";
import { RoomType } from "@/types/RoomType";
import { UserType } from "@/types/UserType";
import { DEBOUNCE_DELAY } from "@/utils/Constants";
import { createChannel } from "@/utils/supabase/client";
import {
    REALTIME_LISTEN_TYPES,
    REALTIME_PRESENCE_LISTEN_EVENTS
} from "@supabase/realtime-js";
import { useOtherUsersStore } from "@/stores/otherUsersStore";

const activateRoom = async (roomId: string | null) => {

    if (roomId) return await updateRoomStatusById(roomId, 'active')
}

const deactivateRoom = async (roomId: string) => {
    if (roomId) return await updateRoomStatusById(roomId, 'inactive');
}
const LoadRoom = () => {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [room, setRoom] = useState<RoomType>();
    const [username, setUsername] = useState<string>();
    const [currentUser, setCurrentUser] = useState<UserType>();
    const [debouncedUsername] = useDebounce(username, DEBOUNCE_DELAY);
    const { otherUsers, addOtherUser, removeOtherUserByUsername } = useOtherUsersStore();

    const handleCreateUser = async () => {
        if (debouncedUsername && room?.id) {
            setCurrentUser({ room_id: room.id, username: debouncedUsername });
        }
    }

    const handleCancel = async () => {
        if (room && otherUsers?.length === 0) {
            await deactivateRoom(room?.id);
            redirect("/");
        }
    }

    useEffect(() => {
        (async () => {
            if (!room) {
                const result = await activateRoom(roomId);
                if (!result?.error) setRoom(result);
            }

            if (currentUser) {
                if (room?.id) {
                    const roomChannel = createChannel(`room_${room.id}`, room.id);
                    roomChannel
                        .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN },
                        ({ newPresences }) => {
                            const joinedUser = newPresences?.at(0);
                            // Check if user who joined is another player
                            if (joinedUser?.username !== currentUser.username) {
                                // Add newly joined user to other players list
                                addOtherUser({ ...joinedUser } as UserType);
                            }
                        })
                        .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
                            async ({ leftPresences }) => {
                            const leftUser = leftPresences.map(value => value.username)?.at(0);
                            removeOtherUserByUsername(leftUser);
                        })
                        .subscribe(async (status) => {
                            if (status !== 'SUBSCRIBED') { return }
                            // Track current user's presence
                            await roomChannel.track(currentUser);
                        });
                }
            }

            if (isLoading) {
                setIsLoading(false);
            }

        })();

    }, [room, currentUser]);

    useEffect(() => {
        window.addEventListener("beforeunload", async (event) => {
            event.preventDefault();
            event.returnValue = '';
            if (room && otherUsers.length === 0) {
                await updateRoomStatusById(room.id, "inactive");
            }
        });

        return () => {
            window.removeEventListener("beforeunload", () => {})
        }
    }, [room]);

    return (
        <>
            {isLoading && <div>Loading...</div>}
            {!isLoading && !room &&
                <div className="flex gap-4 items-center flex-col">
                    <span>Room does not exists</span>
                    <ButtonComponent text="Back" onClick={() => redirect("/")}/>
                </div>
            }
            {!isLoading && room && !currentUser &&
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
                            <ButtonComponent text="Cancel" onClick={handleCancel}/>
                            <ButtonComponent text="Submit" isDisabled={!username} onClick={handleCreateUser}/>
                        </div>
                    </div>
                </div>
            }
            {room && currentUser && <TableTopComponent room={room} currentUser={currentUser} otherUsers={otherUsers} />}
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