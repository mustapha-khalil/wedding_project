import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import ImageSlider from "../../components/ImageSliderShow/ImageSlider";
import DefaultText from "../../components/DefaultText";

import { cloudinaryURL } from "./../../helpers/cloudinaryURL";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const HallDetailScreen = (props) => {
  const { route, navigation } = props;

  const { hallId, name, email, address, location, number, images, price } =
    route.params;

  const userInfo = useSelector((state) => state.Auth.userInfo);

  const convertedImagesUrl = images.map((image) => cloudinaryURL + image);

  const mapIconClickHandler = () => {
    navigation.navigate("MapView", {
      screen: "Map",
      params: {
        location: location,
        title: name,
      },
    });
  };

  const { id: userId, reservation } = userInfo;

  let halls = useSelector((state) => state.halls.hallList);
  const hall = halls.find((h) => h.id === hallId);

  const favorite = () => {
    if (Object.keys(userInfo).length === 0) return false;
    if (userInfo.favorites.includes(hallId)) return true;
    return false;
  };

  const reserveClickHandler = () => {
    navigation.navigate({
      name: "CalendarReserve",
      params: {
        hallId,
        userId,
      },
    });
  };

  const contactHostClickHandler = () => {
    navigation.navigate("ChatStack", {
      screen: "UserChat",
      params: {
        title: name,
        contactId: hallId,
        contactImage: images[0],
      },
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView>
        <View style={styles.screenContainer}>
          <View style={styles.imagesContainer}>
            <ImageSlider
              // images={[source, source1, source]}
              images={[...convertedImagesUrl]}
              hallId={hallId}
              isFavorite={favorite()}
              scrollEnabled={true}
            />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.hallNameContainer}>
              <DefaultText styles={{ fontSize: 32, marginBottom: 10 }}>
                {name}
              </DefaultText>
              <View style={styles.location}>
                <DefaultText styles={{ fontSize: 14 }}>{address}</DefaultText>

                <TouchableOpacity onPress={mapIconClickHandler}>
                  <Feather name="map-pin" size={22} color="green" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <DefaultText styles={{ fontSize: 24 }}>Prices</DefaultText>
              <View style={styles.offer}>
                <DefaultText styles={{ width: "70%" }}>
                  We offer one of the best services there is, let us handle
                  everything for you and you won't regret it
                </DefaultText>
                <Text style={{ alignSelf: "center" }}>{price}$ per person</Text>
              </View>
              <View style={styles.offer}>
                <DefaultText styles={{ width: "70%" }}>
                  Our Premium Offer. Our best offer with the North hall, let
                  everything be on us and have a beautiful nice wedding
                </DefaultText>
                <Text style={{ alignSelf: "center" }}>2000$</Text>
              </View>
              <View style={styles.offer}>
                <DefaultText style={{ width: "70%" }}>
                  Our Premium ooOffer. Our best offer with the North hall, let
                  everything be on us and have a beautiful nice wedding
                </DefaultText>
                <Text style={{ alignSelf: "center" }}>2000$</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={contactHostClickHandler}
              style={[
                styles.reserveButtonContainer,
                { backgroundColor: "white" },
              ]}
            >
              <DefaultText
                styles={{ ...styles.reserveButtonText, color: "black" }}
              >
                CONTACT HOST
              </DefaultText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={reserveClickHandler}
              style={styles.reserveButtonContainer}
            >
              <DefaultText styles={styles.reserveButtonText}>
                RESERVE
              </DefaultText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  imagesContainer: {
    height: width,
  },
  infoContainer: {
    marginTop: 15,
    width: "90%",
    alignSelf: "center",
  },
  hallNameContainer: {
    padding: 20,
    paddingLeft: 0,
    borderBottomWidth: 0.3,
  },
  location: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    padding: 20,
    paddingLeft: 0,
    borderBottomWidth: 0.3,
  },
  offer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  reserveButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
    marginVertical: 5,
  },
  reserveButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});

export default HallDetailScreen;
