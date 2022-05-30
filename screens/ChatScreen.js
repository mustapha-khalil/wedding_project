import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { GiftedChat, Bubble, Send } from "react-native-gifted-chat";
import { showMessage } from "react-native-flash-message";
import { io } from "socket.io-client";

import { URL } from "./../helpers/url";
import { cloudinaryURL } from "./../helpers/cloudinaryURL";
import DefaultText from "../components/DefaultText";

const socket = io.connect(URL);

const ChatScreen = (props) => {
  const { route, navigation } = props;

  const { title, chats, contactImage, contactId, roomId } = route.params;

  const [messages, setMessages] = useState([]);

  const {
    id: userId,
    firstName,
    lastName,
    profileImage,
  } = useSelector((state) => state.Auth.userInfo);

  useEffect(() => {
    socket.on(userId, async (messagesReceived) => {
      console.log("id of user that received message ", userId);
      console.log("messagesReceived ", messagesReceived);
      console.log("type of time ", typeof messagesReceived[0].createdAt);

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messagesReceived)
      );
    });
  }, []);

  useEffect(() => {
    const convertedMessages = chats.map((chat) => {
      const { _id, message, time, senderId } = chat;
      const newMessage = {
        _id: _id.toString(),
        text: message,
        createdAt: time,
        user: {
          _id: senderId.toString(),
          name: senderId === userId ? firstName + " " + lastName : title,
          avatar:
            senderId === userId
              ? cloudinaryURL + profileImage
              : cloudinaryURL + contactImage,
        },
      };
      return newMessage;
    });

    setMessages(convertedMessages);
  }, []);

  console.log("userId ", userId);

  const onSend = useCallback(async (messages = []) => {
    // const time = messages[0].createdAt;
    // console.log("time ", time.getHours() + ":" + time.getMinutes());
    messages[0].user.avatar = cloudinaryURL + profileImage;
    console.log("message ", messages);
    console.log("type of time in send ", typeof messages[0].createdAt);
    console.log("type of message in send ", typeof messages);
    socket.emit("sentMessage", { contactId, messages });
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );

    const message = messages[0];

    const { _id, createdAt, text, user } = message;
    const newMessage = {
      message: text,
      senderId: userId,
      receiverId: contactId,
      time: createdAt,
    };

    try {
      await fetch(`${URL}/api/chat/sendMessage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: roomId, newMessage }),
      });
    } catch (err) {}
  }, []);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#2e64e5",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ marginBottom: 4, marginRight: 5 }}>
          <MaterialCommunityIcons
            name="send-circle"
            size={42}
            color="#2e64e5"
          />
        </View>
      </Send>
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />;
  };

  return (
    <View style={styles.screenContainer}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userId,
          name: "mustafa",
        }}
        renderBubble={renderBubble}
        alwaysShowSend
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default ChatScreen;

// setMessages([
//   {
//     _id: 4,
//     text: "Thanks Jenny, sure why not",
//     createdAt: new Date(),
//     user: {
//       _id: userId,
//       name: "React Native",
//       avatar: "https://placeimg.com/140/140/any",
//     },
//   },
//   {
//     _id: 3,
//     text: "You look like a handsome man, I want to get to know you",
//     createdAt: new Date(),
//     user: {
//       _id: 2,
//       name: "React Native",
//       avatar: "https://placeimg.com/140/140/any",
//     },
//   },
//   {
//     _id: 2,
//     text: "Hey jenny",
//     createdAt: new Date(),
//     user: {
//       _id: userId,
//       name: "React Native",
//       avatar: "https://placeimg.com/140/140/any",
//     },
//   },

//   {
//     _id: 1,
//     text: "Hello developer",
//     createdAt: new Date(),
//     user: {
//       _id: 2,
//       name: "React Native",
//       avatar: "https://placeimg.com/140/140/any",
//     },
//   },
//   {
//     _id: 0,
//     text: "Hello girl",
//     createdAt: new Date(),
//     user: {
//       _id: userId,
//       name: "React Native",
//       avatar: "https://placeimg.com/140/140/any",
//     },
//   },
// ]);
