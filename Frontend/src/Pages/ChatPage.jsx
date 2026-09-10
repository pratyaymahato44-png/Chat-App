import toast from "react-hot-toast"


function ChatPage(){
    return (
        <div>
            ChatPage
            <button onClick={() => toast.success("You clicked")}>click me</button>
        </div>
    )
}

export default ChatPage