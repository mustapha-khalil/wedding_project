import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";

import { io } from "socket.io-client";

import { URL } from "../../helpers/url";

import DefaultText from "../../components/DefaultText";
import {
  getHallChats,
  setHallChats,
  setHallStatus,
} from "../../store/actions/HallChat";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import HallChatItem from "./../../components/HallChatItem";
import { editHall } from "./../../store/actions/Auth";

const socket = io.connect(URL);

const ChatsScreen = (props) => {
  const { navigation } = props;

  const [flag, setFlag] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const token = useSelector((state) => state.Auth.token);
  const hallInfo = useSelector((state) => state.Auth.hallInfo);
  const chatsDetails = useSelector((state) => state.HallChats.hallChats);
  const status = useSelector((state) => state.HallChats.hallChatStatus);
  const userType = useSelector((state) => state.Auth.userType);

  const { hallName, id: hallId } = hallInfo;

  console.log("hallInfo ", hallInfo);

  const tryAgain = () => {
    dispatch(setHallStatus(100));
  };

  useEffect(() => {
    const getMessages = () => {
      dispatch(getHallChats(hallInfo.chatRooms));
    };
    if (token && hallInfo.chatRooms?.length !== 0 && status === 100) {
      setLoading(true);
      setFlag(true);
      getMessages();
    }
    if (status === 100) {
      setLoading(true);
      getMessages();
    }
  }, [hallInfo, status, hallInfo.chatRooms]);

  // useEffect(() => {
  //   if (loading) getMessages();
  // }, [loading]);

  useEffect(() => {
    if (status !== 100) {
      setLoading(false);
      setFlag(false);
    }
  }, [status]);

  useEffect(() => {
    if (chatsDetails.length !== 0 && flag === false) {
      setFlag(true);
      setLoading(false);
    }
  }, [chatsDetails]);

  // try setting a listener for every room and pass room id with receiverId
  useEffect(() => {
    const newChatRoomListener = {
      contactId: hallId,
    };
    const newChatRoomStringListener = JSON.stringify(newChatRoomListener);
    console.log(
      "newChatRoomStringListener ",
      newChatRoomListener,
      typeof newChatRoomListener
    );

    socket.on(newChatRoomStringListener, (messageWithId) => {
      console.log("messageWithId ", messageWithId);
      const { chatRoom, messages } = messageWithId;
      const newChatRooms = [chatRoom, ...hallInfo.chatRooms];
      const newHallInfo = {
        ...newHallInfo,
        chatRooms: newChatRooms,
      };

      dispatch(editHall(newHallInfo));
      tryAgain();
    });

    if (flag && chatsDetails.length !== 0) {
      socket.removeAllListeners();

      for (let i = 0; i < hallInfo.chatRooms?.length; i++) {
        const objectListener = {
          contactId: hallId,
          chatRoom: hallInfo.chatRooms[i],
        };

        const stringObjectListener = JSON.stringify(objectListener);
        socket.on(stringObjectListener, (messagesReceived) => {
          const chatRoom = chatsDetails.find(
            (chatDetails) => chatDetails._id === hallInfo.chatRooms[i]
          );

          const newMessage = {
            _id: messagesReceived[0]._id,
            message: messagesReceived[0].text,
            time: messagesReceived[0].createdAt,
            senderId: messagesReceived[0].user._id,
            receiverId: hallId,
          };

          chatRoom.chats.unshift(newMessage);

          const newChats = [...chatsDetails];
          newChats.sort((x, y) => {
            return x._id === chatRoom._id ? -1 : y === chatRoom._id ? 1 : 0;
          });

          dispatch(setHallChats(newChats));
        });
      }
    }
  }, [flag, chatsDetails]);

  const goToLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };

  const chatClickHandler = () => {
    navigation.navigate("Chat", {});
  };

  const renderItem = ({ item }) => {
    return <HallChatItem navigation={navigation} item={item} />;
  };

  const insets = useSafeAreaInsets();

  if (!token) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}
        edges={["left", "right"]}
      >
        <View style={styles.notLoggedIn}>
          <DefaultText
            styles={{
              fontSize: 18,
              fontFamily: "open-sans-bold",
              marginBottom: 10,
            }}
          >
            Login To See Your Messages
          </DefaultText>
          <DefaultText onPress={goToLogin} styles={{ color: "blue" }}>
            Go to Login
          </DefaultText>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text>Loading</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 500) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["left", "right"]}
      >
        <View
          style={[{ flex: 1, alignItems: "center", justifyContent: "center" }]}
        >
          <TouchableOpacity onPress={tryAgain}>
            <Ionicons name="reload" size={36} color="black" />
          </TouchableOpacity>
          <Text>Reload</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (chatsDetails.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <View style={styles.notLoggedIn}>
          <DefaultText
            styles={{
              fontSize: 18,
              fontFamily: "open-sans-bold",
            }}
          >
            NO MESSAGES
          </DefaultText>
          <DefaultText styles={{ color: "black" }}>
            Your message will appear here
          </DefaultText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: "white",
      }}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          keyExtractor={(item) => `${item._id}`}
          data={chatsDetails}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={tryAgain} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notLoggedIn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

export default ChatsScreen;
