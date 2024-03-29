import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { showMessage } from "react-native-flash-message";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

import { URL } from "../../helpers/url";
import { editHall } from "../../store/actions/Auth";

import CustomHeaderButton from "../../components/HeaderButton";
import DefaultText from "../../components/DefaultText";
import HallImage from "../../components/HallImage";
import customBackArrow from "./../../helpers/customBackArrow";
import customBackHandler from "./../../helpers/customBackHandler";

const { width } = Dimensions.get("window");

const EditImagesScreen = ({ navigation, route }) => {
  const [imageSelected, setImageSelected] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useSelector((state) => state.Auth.token);
  const hallInfo = useSelector((state) => state.Auth.hallInfo);

  const { id: hallId, images } = hallInfo;

  const selected = [];
  for (let i = 0; i < images.length; i++) {
    selected[images[i]] = false;
  }

  const [selectedImages, setSelectedImages] = useState(selected);

  useLayoutEffect(() => {
    console.log("isSubmitting", isSubmitting);
    customBackArrow({ navigation, isSubmitting });
  }, [isSubmitting]);

  useEffect(() => {
    const backHandler = customBackHandler({ navigation, isSubmitting });

    return () => {
      console.log("useEffect returned");
      backHandler.remove();
    };
  }, [isSubmitting]);

  useLayoutEffect(() => {
    if (Object.values(selectedImages).includes(true)) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="Delete"
              iconName="ios-remove-circle-sharp"
              onPress={deleteHallImages}
              style={{
                opacity: isSubmitting ? 0.3 : 1,
                color: "red",
              }}
            />
          </HeaderButtons>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: null,
      });
    }
  }, [selectedImages, isSubmitting]);

  const dispatch = useDispatch();

  const deleteHallImages = async () => {
    let deleteIds = [];
    for (let i = 0; i < images.length; i++) {
      if (selectedImages[images[i]] === true) {
        deleteIds.push(images[i]);
      }
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${URL}/api/hall/deleteImages/${hallId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(deleteIds),
      });

      const responseData = await response.json();

      setSelectedImages((previousState) => {
        let newArray = [];

        const newIdsArray = Object.keys(previousState).filter((key) => {
          return !deleteIds.includes(key);
        });

        for (let i = 0; i < newIdsArray.length; i++) {
          newArray[newIdsArray[i]] = false;
        }
        return newArray;
      });
      if (response.status !== 200) {
        setIsSubmitting(false);
        const errorMessage = responseData.message;
        showMessage({
          message: errorMessage,
          type: "default",
          color: "white",
          backgroundColor: "red",
          style: { borderRadius: 20 },
        });
        return;
      }

      const successMessage = responseData.message;
      showMessage({
        message: successMessage,
        type: "success",
        color: "white",
        backgroundColor: "black",
        style: { borderRadius: 5 },
      });
      setIsSubmitting(false);
      dispatch(editHall(responseData.updatedHall));
    } catch (err) {
      setIsSubmitting(false);
      console.log("err ", err);
    }
  };

  const addHallImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Allow access to camera in your settings"
      );
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      // base64: true,
      quality: 1,
    });
    if (!result.cancelled) {
      // setImageSelected(result.uri);
      setIsSubmitting(true);
      const imageData = new FormData();
      imageData.append("profileImage", {
        name: new Date() + "_profile",
        uri: result.uri,
        type: "image/jpg" || "image/png" || "image/jpeg",
      });
      try {
        const res = await fetch(`${URL}/api/hall/addImage/${hallId}`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + token,
          },
          body: imageData,
        });
        const resData = await res.json();
        const { newHallInfo: updatedHall, newImage } = resData;

        if (res.status === 200) {
          dispatch(editHall(updatedHall));
          setSelectedImages((previousState) => {
            let newArray = [];
            for (const key in previousState) {
              newArray[key] = previousState[key];
            }
            newArray[newImage] = false;
            return newArray;
          });
        }

        if (res.status !== 200) {
          const errorMessage = resData.message;
          showMessage({
            message: errorMessage,
            type: "default",
            color: "white",
            backgroundColor: "red",
            style: { borderRadius: 20 },
          });
        }
        setIsSubmitting(false);
      } catch (err) {
        showMessage({
          message: err.message || "An unknown error occured, Please try again",
          type: "default",
          color: "white",
          backgroundColor: "red",
          style: { borderRadius: 20 },
        });
        console.log("errorrr ", err);
      }
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.profileContainer}>
        <View style={[styles.imagesContainer]}>
          {images.map((image, index) => {
            return (
              <HallImage
                key={image}
                image={image}
                onImageLongPressed={(selected) => {
                  setSelectedImages((previousState) => {
                    let newArray = [];
                    for (const key in previousState) {
                      newArray[key] = previousState[key];
                    }
                    newArray[image] = selected;
                    return newArray;
                  });
                }}
              />
            );
          })}

          {/*
          <View
            style={{
              width: width / 2,
              height: width / 2,
              borderWidth: 0.5,
              borderColor: "gray",
            }}
          >
            <Image
              source={{ uri: convertedImagesUrl[0] }}
              style={{
                ...styles.image,
                width: "100%",
                height: "100%",
                aspectRatio: 2 / 2,
              }}
            />
          </View> */}
          <TouchableOpacity onPress={addHallImage}>
            <View
              style={{
                width: width / 2,
                height: width / 2,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 0.5,
                borderColor: "gray",
              }}
            >
              <DefaultText
                styles={{ fontSize: 18, fontFamily: "open-sans-bold" }}
              >
                ADD
              </DefaultText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default EditImagesScreen;
