import React from "react";
import { View, Text, StyleSheet } from "react-native";
import DefaultText from "./../components/DefaultText";

const ChatScreen = (props) => {
  const { navigation } = props;

  return (
    <View style={styles.screenContainer}>
      <DefaultText
        styles={{
          fontSize: 18,
          fontFamily: "open-sans-bold",
          marginBottom: 10,
        }}
      >
        No new messages
      </DefaultText>
      <DefaultText>When you have a message, it will appear here</DefaultText>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "white",
  },
});

export default ChatScreen;
