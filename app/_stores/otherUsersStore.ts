import { create } from 'zustand';
import { UserType } from "@/types/UserType";

interface OtherUsersState {
    otherUsers: UserType[]
    addOtherUser: (by: UserType) => void
    removeOtherUserByUsername: (username: string) => void
}

export const useOtherUsersStore = create<OtherUsersState>()((set, get) => ({
    otherUsers: [],
    addOtherUser: (newUser) => {
        set({ otherUsers: [...get().otherUsers, newUser] });
    },
    removeOtherUserByUsername: (username) => {
        set({otherUsers: get().otherUsers.filter((user) => user.username !== username)});
    }
}))