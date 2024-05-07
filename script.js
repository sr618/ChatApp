const socket = io("http://localhost:5000");

let currentRoom = "";

document.getElementById("roomForm").addEventListener("submit", e => {
    e.preventDefault();
    const room = document.getElementById("roomInput").value.trim();
    const username = document.getElementById("usernameInput").value.trim();
    if (room && username) {
        socket.emit("joinRoom", { room, username });
        currentRoom = room;
        document.getElementById("roomForm").style.display = "none";
        document.getElementById("page-content").style.display = "block";
    }
});

document.getElementById("messageForm").addEventListener("submit", e => {
    e.preventDefault();
    const message = document.getElementById("messageInput").value.trim();
    if (message) {
        socket.emit("message", { room: currentRoom, message });
        document.getElementById("messageInput").value = "";
    }
});

socket.on("message", ({ message, user }) => {
    const messageList = document.getElementById("messageList");
    const li = document.createElement("li");
    li.textContent = `${user}: ${message}`;
    messageList.appendChild(li);
});

socket.on("userJoined", ({ username, users }) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
    });
    const notification = document.createElement("div");
    notification.textContent = `${username} joined the room.`;
    document.getElementById("notifications").appendChild(notification);
});

socket.on("userLeft", ({ username, users }) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
    });
    const notification = document.createElement("div");
    notification.textContent = `${username} left the room.`;
    document.getElementById("notifications").appendChild(notification);
});

socket.on("private", ({ msg }) => {
    const privateMessage = document.createElement("div");
    privateMessage.textContent = msg;
    document.getElementById("privateMessages").appendChild(privateMessage);
});
