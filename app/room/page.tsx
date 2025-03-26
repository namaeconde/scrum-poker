'use client'

import { fetchRoomById } from '@/utils/supabase/actions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Room() {
    const searchParams = useSearchParams();
    const [room, setRoom] = useState<{id: string}>();

    useEffect(() => {
        const fetchRoom = async () => {
            const id = searchParams.get('id');
            if (id) {
                const room = await fetchRoomById(id);
                setRoom(room);
            }
        }
        fetchRoom();
    }, [searchParams]);
    return (
        <pre>{ JSON.stringify(room)}</pre>
    )
}