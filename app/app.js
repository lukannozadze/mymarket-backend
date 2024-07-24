// const socket = io("ws://localhost:3000");

// const nameContainer = document.querySelector(".name-container");
// const chatContainer = document.querySelector(".chat-container");

// document.querySelector(".name-input").addEventListener("submit", (e) => {
//   e.preventDefault();
//   nameContainer.style.display = "none";
//   chatContainer.style.display = "flex";
// });

// function sendMessage(e) {
//   e.preventDefault();
//   const input = document.querySelector(".message-input");
//   const message = input.value;
//   const name = document.querySelector(".username").value;
//   if (message) {
//     socket.send(message, name);
//     input.value = "";
//   }
//   input.focus();

//   return false;
// }

// document.querySelector(".chat-form").addEventListener("submit", sendMessage);

// socket.addEventListener("message", (message) => {
//   console.log(message);
//   const el = document.createElement("li");
//   el.textContent = ` ${message}`;
//   document.querySelector("ul").appendChild(el);
// });
