'use client'

import Image from "next/image";
import Button from "@/components/button";
import { createRoom } from '@/utils/supabase/actions';
import { redirect } from 'next/navigation'
import Input from "@/components/input";
import { useState } from "react";
import { useDebounce } from "use-debounce";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string>();
  const [isCreateRoom, setIsCreateRoom] = useState(false);
  const [debouncedCurrentUser] = useDebounce(currentUser, 500);

  const handleCreateRoom = async () => {
    if (!debouncedCurrentUser) return;
    // const room = await createRoom();
    // // TODO: Add create user to 'users' table with room.id
    // redirect(`/room?id=${room.id}`);
  }

  return (
      <div
          className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-mono)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          {
              isCreateRoom ?
              <div className="p-4 sm:p-5 sm:w-auto shadow-md inset-shadow-sm">
                  <div className="flex gap-4 items-center flex-col">
                      <Input label="Input your username"
                             defaultValue=""
                             onChange={(e) => {
                                 setCurrentUser(e.target.value)
                             }}/>
                      <div className="flex gap-2">
                          <Button text="Cancel" onClick={() => setIsCreateRoom(false)}/>
                          <Button text="Submit" isDisabled={!currentUser} onClick={() => handleCreateRoom()}/>
                      </div>
                  </div>
              </div> :
              <>
                  <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left">
                      <li className="tracking-[-.01em]">Create a room</li>
                      <li className="tracking-[-.01em]">Invite players</li>
                      <li className="tracking-[-.01em]">Cast your vote</li>
                  </ol>
                  <div className="flex gap-4 items-center flex-col">
                      <Button text="Create room" onClick={() => setIsCreateRoom(true)}/>
                  </div>
              </>
          }
        </main>
          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
              <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  <Image
                      aria-hidden
                      src="/file.svg"
                      alt="File icon"
                      width={16}
            height={16}
          />
          About
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Contact
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
