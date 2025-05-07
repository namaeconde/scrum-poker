'use client'

import { RoomType } from "@/types/RoomType";
import ButtonComponent from "@/components/button/button.component";
import { UserType } from "@/types/UserType";
import { User } from 'lucide-react';
import { createChannel } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import RadioGroupComponent from "@/components/radio-group/radio-group.component";
import {
    REALTIME_LISTEN_TYPES,
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
    REALTIME_PRESENCE_LISTEN_EVENTS
} from "@supabase/realtime-js";

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

export default function TableTopComponent({ room, currentUser }: TableProps) {
    const [currentStatus] = useState<string>("Cast your vote");
    const [currentVote] = useState<number>(0);
    const [otherPlayers, setOtherPlayers] = useState<PlayerProps[]>([]);
    const [isLockedIn, setIsLockedIn] = useState(false);
    const roomChannel = createChannel(`room_${room.id}`);

    const scrumScoring = [
        { name: "1", value: "1" },
        { name: "2", value: "2" },
        { name: "3", value: "3" },
        { name: "5", value: "5" },
        { name: "8", value: "8" },
    ];

    useEffect(() => {
        (async () => {
            if (roomChannel) {
                roomChannel
                    .on(
                        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
                        {
                            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
                            schema: 'public',
                            table: 'votes',
                            filter: `room_id=eq.${room.id}`
                        },
                        () => {
                            // TODO: Start a timer to show the results if all players have voted
                            // Clear the votes from the db after the timer is up
                        }
                    )
                    .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN },
                        ({ newPresences }) => {
                        const joinedUser = newPresences?.at(0);

                        // Check if user who joined is another player
                        if (joinedUser?.id !== currentUser.id) {
                            // Add newly joined user to other players list
                            setOtherPlayers(prev => [...prev, {...joinedUser} as PlayerProps])
                        }
                    })
                    .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
                        ({ leftPresences }) => {
                        const leftUserId = leftPresences.map(value => value.id)?.at(0);
                        navigator.sendBeacon(`/api/room/leave?roomId=${room.id}&userId=${leftUserId}`);
                        setOtherPlayers(prev => prev.filter(player => player.id !== leftUserId));

                    })
                    .subscribe(async (status) => {
                        if (status !== 'SUBSCRIBED') { return }
                        // Track current user's presence
                        await roomChannel.track(currentUser);
                    })
            }
        })();

        return () => {
            roomChannel.untrack().then((presenceUntrackStatus) => {
                console.log("presence untracked");
                console.log(presenceUntrackStatus)
            })
        }
    }, [room.id, currentUser.id]);

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
                        <RadioGroupComponent radioButtons={scrumScoring} isDisabled={isLockedIn}/>
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