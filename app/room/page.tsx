'use client'

import { fetchRoomById } from '@/utils/supabase/actions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Room() {
    const searchParams = useSearchParams();
    const [room, setRoom] = useState<{id: string}>();

    const fetchRoom = async () => {
        const id = searchParams.get('id');
        if (id) {
            const newValue = await fetchRoomById(id);
            setRoom(newValue);
            return newValue;
        }
    }

    const storedSessionRoom = JSON.parse(sessionStorage.getItem('room') as string);

    const leaveRoom = () => {
        if (document.visibilityState === "hidden" && sessionStorage.getItem('isClosing') === 'true') {
            navigator.sendBeacon(`/api/room/leave?id=${storedSessionRoom?.id}`);
        }
    }

    useEffect(() => {
        const existingRoom = storedSessionRoom;
        if (!existingRoom) {
            fetchRoom().then((room) => {
                sessionStorage.setItem('room', JSON.stringify(room));
            });
        } else {
            setRoom({...existingRoom});
        }

        window.addEventListener('beforeunload', (e) => {
            sessionStorage.setItem('isClosing', 'true');
            setTimeout(() => {
                sessionStorage.removeItem('isClosing');
            }, 1000); // Slight delay to ensure the flag is cleared on refresh
            e.preventDefault();
        });

        document.onvisibilitychange = () => {
            leaveRoom();
        };

    }, [searchParams]);

    return (
        <pre>{ JSON.stringify(room)}</pre>
    )
}