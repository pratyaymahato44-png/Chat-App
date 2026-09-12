import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import {io} from "socket.io-client"


const baseURL = import.meta.env.MODE === "development" ? "http://localhost:4000" : "/"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuthentication: async () => {
        set({ isCheckingAuth: true})

        try {
            const response = await axiosInstance.get("/auth/check")
            const user = response.data.data

            set({authUser: user})
            get().connectSocket(user)

        } catch (error) {
            console.error("Error in CheckAuth", error)
            set({authUser: null})
        } finally{
            set({ isCheckingAuth: false})
        }
    },

    clearAuthentication: () => {
        set({authUser: null, isCheckingAuth: false, onlineUsers: []})
        get().disConnectSocket()
    },

    connectSocket: (user) => {

        const isConnected = get().socket?.connected
        if(!user || isConnected) return

        const socket = io(baseURL, {query: {userId: user._id}})

        set({ socket: socket })

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disConnectSocket: () => {
        const socket = get().socket
        if(socket?.connected) socket.disconnect()
            set({ socket: null })
    }
   
}))