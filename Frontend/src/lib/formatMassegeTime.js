

export const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    })
}