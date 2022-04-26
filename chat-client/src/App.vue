<script setup>
import { io } from "socket.io-client";
import { onBeforeMount, ref } from "vue";

const socket = io("http://localhost:3001");
const messages = ref([]);
const participants = ref([]);
const messageText = ref("");
const joined = ref(false);
const name = ref("");
const typingDisplay = ref("");
function scrollToBottom() {
  setTimeout(() => {
    const messageScroll = document.getElementsByClassName("msg_card_body")[0];
    messageScroll.scrollTop = messageScroll.scrollHeight;
  }, 100);
}
onBeforeMount(() => {
  socket.emit("findAllMessages", {}, (res) => {
    messages.value = res;
  });

  socket.on("message", (res) => {
    messages.value.push(res);

    scrollToBottom();
  });

  socket.on("typing", ({ name, isTyping }) => {
    if (isTyping) typingDisplay.value = `${name} is typing...`;
    else typingDisplay.value = "";
  });
});

const sendMessage = () => {
  if (messageText.value.trim() === "") return;
  socket.emit("createMessage", { text: messageText.value }, (res) => {
    messageText.value = "";
    clearTimeout(timeout);
    socket.emit("typing", { isTyping: false });
  });
};
const join = () => {
  socket.emit("join", { name: name.value }, (res) => {
    console.log(`res`, res);
    joined.value = true;
    // object into array
    participants.value = Object.keys(res).map((key) => {
      return res[key];
    });
    scrollToBottom();

  });
};

let timeout;
const emitTyping = () => {
  socket.emit("typing", { isTyping: true });
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    socket.emit("typing", { isTyping: false });
  }, 2000);
};
</script>

<template>
  <div id="app" class="container-fluid h-50">
    <div class="row justify-content-center h-100">
      <div class="col-md-4 col-xl-3 chat">
        <div class="card mb-sm-3 mb-md-0 contacts_card">
          <div class="card-header">
            <div class="input-group">
              <input
                type="text"
                placeholder="Search..."
                name=""
                class="form-control search"
              />
              <div class="input-group-prepend">
                <span class="input-group-text search_btn"
                  ><i class="fas fa-search"></i
                ></span>
              </div>
            </div>
          </div>
          <div class="card-body contacts_body">
            <ul class="contacts">
              <div v-if="!joined">
                <form @submit.prevent="join">
                  <div class="input-group">
                    <input
                      type="text"
                      v-model="name"
                      placeholder="What's your name?"
                      name=""
                      class="form-control search"
                    />
                    <div class="input-group-prepend">
                      <span class="input-group-text search_btn">
                        <button class="btn" type="submit">Join</button>
                      </span>
                    </div>
                  </div>
                </form>
              </div>
              <div v-else v-for="participant in participants">
                <li class="">
                  <div class="d-flex bd-highlight">
                    <div class="img_cont">
                      <img
                        src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png"
                        class="rounded-circle user_img"
                      />
                      <span class="online_icon"></span>
                    </div>
                    <div class="user_info">
                      <span>{{ participant }}</span>
                      <p>is online</p>
                    </div>
                  </div>
                </li>
              </div>
            </ul>
          </div>
          <div class="card-footer"></div>
        </div>
      </div>
      <div class="col-md-8 col-xl-6 chat" >
        <div class="card" v-if="joined">
          <div class="card-header msg_head">
            <div class="d-flex bd-highlight">
              <div class="img_cont">
                <img
                  src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png"
                  class="rounded-circle user_img"
                />
                <span class="online_icon"></span>
              </div>
              <div class="user_info">
                <span>Chat</span>
                <p>{{ messages.length }} Messages</p>
              </div>
              <div class="video_cam">
                <span><i class="fas fa-video"></i></span>
                <span><i class="fas fa-phone"></i></span>
              </div>
            </div>
            <span id="action_menu_btn"><i class="fas fa-ellipsis-v"></i></span>
            <div class="action_menu">
              <ul>
                <li><i class="fas fa-user-circle"></i> View profile</li>
                <li><i class="fas fa-users"></i> Add to close friends</li>
                <li><i class="fas fa-plus"></i> Add to group</li>
                <li><i class="fas fa-ban"></i> Block</li>
              </ul>
            </div>
          </div>
          <div class="card-body msg_card_body">
            <div
              class="d-flex justify-content-start mb-4"
              v-for="message in messages"
            >
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png"
                    class="rounded-circle user_img_msg"
                  />
                </div>
                <div class="msg_cotainer">
                  <strong>{{ message.name }}</strong> <br />
                  {{ message.text }}
                  <span class="msg_time">9:12 AM, Today</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div v-if="typingDisplay != ``">{{ typingDisplay }}</div>
            <form @submit.prevent="sendMessage">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control type_msg"
                  placeholder="Type your message..."
                  v-model="messageText"
                  @input="emitTyping"
                />
                <div class="input-group-append">
                  <span class="input-group-text send_btn"
                    >
                  <button class="btn" type="submit">Send</button>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.5.0/css/all.css"
    />
  </div>
</template>

<style>
@import "bootstrap";

@import "./assets/base.css";
@import "./assets/styles.css";
</style>