'use client'

import { RoomType } from "@/types/RoomType";
import ButtonComponent from "@/components/button/button.component";
import { UserType } from "@/types/UserType";
import { User } from 'lucide-react';
import { supabaseClient } from "@/utils/supabase/client";
import { fetchUsersByRoomId } from "@/utils/supabase/actions";
import { useEffect, useState } from "react";
import RadioGroup from "@/components/radio-group";

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
    const [currentStatus] = useState<string>("Cast your vote");
    const [currentVote] = useState<number>(0);
    const [otherPlayers, setOtherPlayers] = useState<PlayerProps[]>([]);
    const [isLockedIn, setIsLockedIn] = useState(false);

    const scrumScoring = [
        { name: "1", value: "1" },
        { name: "2", value: "2" },
        { name: "3", value: "3" },
        { name: "5", value: "5" },
        { name: "8", value: "8" },
    ];

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

    supabaseClient
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
        .on(
            'postgres_changes',
            { 
                event: 'INSERT',
                schema: 'public', 
                table: 'votes',
                filter: `room_id=eq.${room.id}`
            },
            (payload) => {
                console.log(payload);
                // TODO: Start a timer to show the results if all players have voted
                // Clear the votes from the db after the timer is up
            }
        )
        .subscribe()

    const handleVote = () => {
        setIsLockedIn(!isLockedIn)
        if (isLockedIn) {
            // TODO: Add current vote to db
            console.log(`${currentUser.username} Locked in vote: ${currentVote}`)
        } else {
            // TODO: Remove current vote from db
            console.log(`${currentUser.username} Unlocked vote`)
        }
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col items-center gap-10">
                <div className="flex gap-2">
                    {
                        otherPlayers && otherPlayers.length > 0 ? otherPlayers.map(player => {
                            return (<Player username={player.username} key={player.id}  id={player.id}/>)
                        }): <div>Waiting for other players...</div>
                    }
                </div>
                <div className="border-2 border-dotted p-20">{currentStatus}</div>
                <div className="flex flex-col items-center gap-5">
                    <div className="flex gap-2">
                        <RadioGroup radioButtons={scrumScoring} />
                    </div>
                    <div className="flex gap-2">
                        <ButtonComponent text={isLockedIn ? 'Unlock Vote' : 'Lock-in Vote'} onClick={() => handleVote()} />
                    </div>
                    <Player username={currentUser.username} isCurrentUser={true}/>
                </div>
            </div>
        </div>
    )
}