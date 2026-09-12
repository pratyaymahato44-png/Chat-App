import { create } from "zustand";
import {persist} from "zustand/middleware"
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create(persist(
    (set, get) => ({
    users: [],
    conversations: [],
    messages: [],
    selectedUser: null,
    isConversationLoading: false,
    isUserLoading: false,
    isMessageLoading: false,
    activeConversation: null,
    searchQuery: "",
    sidebartab: "chats",
    composerText: "",
    isSoundEnabled: true,
    isSendingMedia: false,

    getUsers: async () => {
        set({ isUserLoading: true})

        try {
            const response = await axiosInstance.get("/messages/users")

            const users = response.data.data
            set((state) => ({
                users: users,

                selectedUser: state.selectedUser && users.some((user) => user._id === state.selectedUser._id) ? state.selectedUser : null
            }))
        } catch (error) {
            console.error("Error in get User", error)
        }finally{
            set({ isUserLoading: false})
        }
    },

    getConversations: async () => {
        set({ isConversationLoading: true })

        try {
            const response = await axiosInstance.get("/messages/conversations")
            set({ conversations: response.data.data})
        } catch (error) {
            console.error("Error in get conversation", error)
        } finally{
            set({ isConversationLoading: false })
        }
    },

    getMessages: async (userId) => {
        if(!userId) return
        set({ isMessageLoading: true })

        try {
            const response = await axiosInstance.get(`/messages/${userId}`)

            set({ messages: response.data.data })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages")
        } finally {
            set({ isMessageLoading: false })
        }
    },

    sendMessage: async (messageData) => {

        const {selectedUser, messages} = get()
        if(!selectedUser) return false

        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set((state) => ({
                messages: [...messages, response.data.data], composerText: ""
            }))
    
            get().getConversations()
            return true
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message")
            return false  
        }
    },

    subscribeToMessages: (userId) => {
        if(!userId) return 

        const socket = useAuthStore.getState().socket

        if(!socket) return

        socket.off("newMessage")
        socket.off("messageDeleted")

        socket.on("newMessage", (newMessage) => {
            if(String(newMessage.senderId) !== String(userId)) return

            set({ messages: [...get().messages, newMessage] })

            get().getConversations()
        })

        socket.on("messageDeleted", (messageId) => {
            set((state) => ({
                messages: state.messages.filter((message) => message._id !== messageId) 
            }))

            get().getConversations()
        })

    },

    unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket?.off("newMessage")

        socket?.off("messageDeleted")
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    setActiveConversationId: (activeConversationId) => {
        set((state) => ({
            activeConversationId,

            selectedUser: state.users.find((user) => user._id === activeConversationId) || state.conversations.find((user) => user._id === activeConversationId) || null,

            messages: activeConversationId ? state.messages : []

        }))
    },

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSidebarTab: (sidebarTab) => set({ sidebarTab }),
    setComposerText: (composerText) => set({ composerText }),
    setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

    sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim()

        if(!conversationId || !messageText) return false

        return get().sendMessage({ text: messageText})
    },

    sendMedia: async({ conversationId, file }) => {
        if(!conversationId || !file) return false

        const formData = new FormData()
        formData.append("media", file)

        set({ isSendingMedia: true})

        try {
           return await get().sendMessage(formData) 
        } catch (error) {
            console.error("Media send failed", error)
        } finally{
            set({ isSendingMedia: false })
        }
    },
    deleteMessage: async (messageId) => {
        if(!messageId) return false

        try {
            await axiosInstance.delete(`/messages/${messageId}`)

            set((state) => ({
                messages: state.messages.filter((message) => message._id !== messageId)
            }))

            toast.success("Message deleted")
            return true
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to delete message"
            )
            return false
        }
    }
}),
{
    name: "imassage-storage",
    partialize: (state) => ({isSoundEnabled: state.isSoundEnabled})
}   
))