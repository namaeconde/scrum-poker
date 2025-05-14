'use client'

import { RoomType } from "@/types/RoomType";
import ButtonComponent from "@/components/button/button.component";
import { UserType } from "@/types/UserType";
import { User } from 'lucide-react';
import { useEffect, useState } from "react";
import RadioGroupComponent from "@/components/radio-group/radio-group.component";
import { useTimer } from "react-timer-hook";

interface TableProps {
    room: RoomType;
    currentUser: UserType;
    otherUsers?: UserType[];
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

const DEFAULT_TIMEOUT_SECONDS = 3;

export default function TableTopComponent({ currentUser, otherUsers }: TableProps) {
    const [currentStatus, setCurrentStatus] = useState<string>("Cast your vote");
    const [currentVote, setCurrentVote] = useState<string>("1");
    const [isLockedIn, setIsLockedIn] = useState(false);
    const getTimerInSeconds = (seconds: number) => {
        const timer = new Date()
        timer.setSeconds(timer.getSeconds() + seconds);
        return timer;
    }

    const {
        totalSeconds,
        start,
        restart,
    } = useTimer({
        expiryTimestamp: getTimerInSeconds(DEFAULT_TIMEOUT_SECONDS),
        autoStart: false,
        onExpire: () => {
            // TODO: Add realtime broadcast of all votes
            setCurrentStatus(`You voted ${currentVote}`);
            setIsLockedIn(false);
        }});

    const scrumScoring = [
        { name: "1", value: "1" },
        { name: "2", value: "2" },
        { name: "3", value: "3" },
        { name: "5", value: "5" },
        { name: "8", value: "8" },
    ];

    useEffect(() => {
        // TODO: Update to only start timer if all players have already voted
        if (isLockedIn) {
            start();
            console.log(`${currentUser.username} Locked in vote: ${currentVote}`);
        } else {
            restart(getTimerInSeconds(DEFAULT_TIMEOUT_SECONDS), false);
            console.log(`${currentUser.username} Unlocked vote`);
        }
    }, [isLockedIn]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col items-center gap-10">
                <div className="flex gap-2">
                    {
                        otherUsers && otherUsers.length > 0 ? otherUsers.map(otherUser => {
                            return (<Player username={otherUser.username} key={otherUser.username}/>)
                        }): <div>Waiting for other players...</div>
                    }
                </div>
                <div className="border-2 border-dotted p-20">{ isLockedIn ? totalSeconds : currentStatus }</div>
                <div className="flex flex-col items-center gap-5">
                    <div className="flex gap-2">
                        <RadioGroupComponent
                            radioButtons={scrumScoring}
                            isDisabled={isLockedIn}
                            onChange={(e) => {
                                setCurrentVote(e.target.value);
                            }}/>
                    </div>
                    <div className="flex gap-2">
                        <ButtonComponent text={isLockedIn ? 'Unlock Vote' : 'Lock-in Vote'} onClick={() => {
                            setIsLockedIn(!isLockedIn)}}
                        />
                    </div>
                    <Player username={currentUser.username} isCurrentUser={true}/>
                </div>
            </div>
        </div>
    )
}