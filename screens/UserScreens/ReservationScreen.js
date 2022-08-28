import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

import HallItem from "../../components/HallItem";
import DefaultText from "../../components/DefaultText";
import { SafeAreaView } from "react-native-safe-area-context";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ReservationScreen = (props) => {
  const { navigation } = props;

  const { reservation } = useSelector((state) => state.Auth.userInfo);

  const { hallId, date } = reservation;

  const userInfo = useSelector((state) => state.Auth.userInfo);
  const hallList = useSelector((state) => state.halls.hallList);

  const reservedHall = hallList.find((hall) => hall.id === hallId);
  const newDate = new Date(date);

  const month = monthNames[newDate.getMonth()];
  const day = newDate.getDay();

  const isItemFavorite = (id) => {
    if (Object.keys(userInfo).length === 0) return false;
    if (userInfo.favorites.includes(id)) return true;
    return false;
  };

  const isFavorite = isItemFavorite(reservedHall.id);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <View style={styles.screenContainer}>
        <DefaultText
          style={{
            fontSize: 20,
            fontFamily: "open-sans",
            alignSelf: "center",
            margin: 10,
          }}
        >
          Your wedding is on the{" "}
          <DefaultText style={{ fontFamily: "open-sans-bold" }}>
            {day}th of {month}
          </DefaultText>
        </DefaultText>

        <HallItem
          isFavorite={isFavorite}
          item={reservedHall}
          navigation={navigation}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    // alignItems: "center",
    // justifyContent: "center",
    flex: 1,
    backgroundColor: "white",
  },
});

export default ReservationScreen;
