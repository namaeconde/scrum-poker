'use client'

import ButtonComponent from "@/components/button/button.component";
import { createRoom } from '@/utils/supabase/actions';
import { redirect } from 'next/navigation'

export default function Home() {

  const handleCreateRoom = async () => {
    const room = await createRoom();
    redirect(`/room?id=${room.id}`);
  }

  return (
      <>
          <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left">
              <li className="tracking-[-.01em]">Create a room</li>
              <li className="tracking-[-.01em]">Invite players</li>
              <li className="tracking-[-.01em]">Cast your vote</li>
          </ol>
          <div className="flex gap-4 items-center flex-col">
              <ButtonComponent text="Create room" onClick={() => handleCreateRoom()}/>
          </div>
      </>
  );
}
