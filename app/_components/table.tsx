'use client'

import { RoomType } from "@/types/RoomType";
import Button from "@/components/button";
import { UserType } from "@/types/UserType";
import { User } from 'lucide-react';
import { supabaseClient } from "@/utils/supabase/client";
import { fetchUsersByRoomId } from "@/utils/supabase/actions";
import { useEffect, useState } from "react";

interface TableProps {
    room: RoomType;
    currentUser: UserType;
}

interface PlayerProps {
    id?: string;
    username: string;
    isCurrentUser?: boolean;
}

const Player = ({ username, isCurrentUser}: PlayerProps) => {
    return (
        <div className={`flex items-center gap-2 rounded-full border-2 p-2 ${ isCurrentUser ? 'text-red-400' : ''}`}>
            <User />{username}
        </div>
    )
}

export default function Table({ room, currentUser }: TableProps) {
    const [otherPlayers, setOtherPlayers] = useState<PlayerProps[]>([]);
    const scrumScoring = ["1","2","3","5","8"];

    useEffect(() => {
        (async () => {
            // Fetch other players already in the room
            const allPlayers = await fetchUsersByRoomId(room.id);

            const otherPlayers = allPlayers?.filter(player => player.id !== currentUser.id);
            if (otherPlayers) {
                setOtherPlayers(otherPlayers);
            }
        })();
    }, [room.id]);

    const roomChanges = supabaseClient
        .channel(`room_${room.id}`)
        .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'users'
            },
            (payload) => {
                console.log(payload);
                setOtherPlayers(prev => prev.filter(player => player.id !== payload.old.id));
            }
        )
        .on(
            'postgres_changes',
            { 
                event: 'INSERT',
                schema: 'public', 
                table: 'users',
                filter: `room_id=eq.${room.id}`
            },
            (payload) => {
                console.log(payload);
                setOtherPlayers(prev => [...prev, payload.new as PlayerProps]);
            }
        )
        .subscribe()

    return (
        <div className="flex flex-col items-center gap-10">
            <div className="flex gap-2">
                {
                    otherPlayers && otherPlayers.length > 0 ? otherPlayers.map(player => {
                        return (<Player username={player.username} key={player.id}  id={player.id}/>)
                    }): <div>Waiting for other players...</div>
                }
            </div>
            <div className="border-2 border-dotted p-20">
                Cast your votes
            </div>
            <div className="flex flex-col items-center gap-5">
                <div className="flex gap-2">
                    {
                        scrumScoring.map((value) => {
                            return (
                                <Button key={value} text={value}/>
                            )
                        })
                    }
                </div>
                <Player username={currentUser.username} isCurrentUser={true}/>
            </div>
        </div>
    )
}