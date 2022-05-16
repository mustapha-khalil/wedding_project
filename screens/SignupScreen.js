import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  BackHandler,
} from "react-native";
import { showMessage, hideMessage } from "react-native-flash-message";
import { Formik, setIn } from "formik";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import Colors from "../constants/Colors";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import validationSchema from "./SignupSchema";
import { useDispatch } from "react-redux";
import { signUp } from "./../store/actions/Auth";
import { URL } from "../helpers/url";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "./../components/HeaderButton";

// envelope // lock

const height = Dimensions.get("window").height;
console.log("height ", height * 0.2);

// WebBrowser.maybeCompleteAuthSession();
// GoogleSignin.configure({
//   webClientId: "",
//   offlineAccess: true,
// });

const SignupScreen = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState();
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "275837775568-u8k7ihqr2gau5e5jrglsdg9v373ivqen.apps.googleusercontent.com",
  });

  useEffect(() => {
    console.log("tryingg");
    if (response?.type === "success") {
      console.log("successs");
      setAccessToken(response.authentication.accessToken);
    }
  }, [response]);

  useEffect(() => {
    if (accessToken) {
      getUserData();
    }
  }, [accessToken]);

  const getUserData = async () => {
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const responseData = await userInfoResponse.json();
    console.log("responseData here ", responseData);

    const { name, email } = responseData;

    const newUserInfo = {
      fullName: name,
      email: email,
      password: "",
      confirmPassword: "",
    };
    setUserInfo(newUserInfo);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          <Item
            title="Save"
            iconName="arrow-back"
            onPress={() => {
              if (!isSubmitting) {
                navigation.goBack(null);
              }
            }}
            style={{ opacity: isSubmitting ? 0.3 : 1 }}
          />
        </HeaderButtons>
      ),
    });
  }, [isSubmitting]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isSubmitting) return true;
      }
    );

    if (isSubmitting) {
      navigation.setOptions({
        gestureEnabled: false,
      });
    }

    if (!isSubmitting) {
      navigation.setOptions({
        gestureEnabled: true,
      });
    }

    return () => {
      console.log("useEffect returned");
      backHandler.remove();
    };
  }, [isSubmitting]);

  const dispatch = useDispatch();

  // console.log("statusBar height", StatusBar.currentHeight);

  const handleSubmitForm = async (values, formikActions) => {
    // send to the server
    const { fullName, email, password } = values;

    // split the fullName
    const nameArray = fullName.split(" ");
    const arraySize = nameArray.length;
    console.log("full name ", nameArray);
    let first = nameArray[0];
    console.log("first ", first);
    console.log();
    for (let i = 1; i < arraySize - 1; i++) {
      console.log(nameArray[i]);
      first = first + " " + nameArray[i];
      console.log("total first name ", first);
    }
    let last = "";
    if (arraySize > 1) last = nameArray[arraySize - 1];
    console.log("last name ", last);

    const user = {
      firstName: first,
      lastName: last,
      email,
      password,
      profileImage: "",
      favorites: [],
      hallId: null,
      booking: null,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${URL}/api/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const responseData = await response.json();
      // console.log("responseData signup ", responseData);

      const { userInfo, token } = responseData;

      console.log("res.status ", response.status);

      if (response.status === 200) {
        dispatch(signUp(token, userInfo));
        formikActions.resetForm();
        formikActions.setSubmitting(false);
        showMessage({
          message: "Signup Successfull",
          type: "success",
          style: { borderRadius: 20 },
        });
      } else {
        const errorMessage = responseData.message;
        showMessage({
          message: errorMessage,
          type: "default",
          color: "white",
          backgroundColor: "red",
          style: { borderRadius: 20 },
        });
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log("error ", error);
      setIsSubmitting(false);
    }

    // }, 2000);
  };

  return (
    // <SafeAreaView style={[styles.formContainer]}>
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   keyboardVerticalOffset={50}
    //   style={[styles.formContainer]}
    //   // enabled={false}
    // >
    <View style={styles.formContainer}>
      <View style={{ marginBottom: "20%" }}></View>

      <ScrollView>
        <Formik
          initialValues={userInfo}
          validationSchema={validationSchema}
          onSubmit={handleSubmitForm}
          enableReinitialize
        >
          {({
            values,
            handleChange,
            handleSubmit,
            touched,
            handleBlur,
            errors,
            isSubmitting,
          }) => {
            let buttonDisabled = true;
            if (
              Object.keys(errors).length == 0 &&
              Object.keys(touched).length != 0
            ) {
              buttonDisabled = false;
            }

            return (
              <View style={styles.inputsContainer}>
                <CustomInput
                  iconName="user"
                  iconSize={32}
                  value={values.fullName}
                  label="Full Name"
                  placeholder="John Smith"
                  onChangeText={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  error={touched.fullName && errors.fullName}
                  editable={accessToken ? false : true}
                />
                <CustomInput
                  iconName="envelope"
                  iconSize={32}
                  value={values.email}
                  label="E-mail Address"
                  keyboardType="email-address"
                  placeholder="example@gmail.com"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  error={touched.email && errors.email}
                  autoCapitalize="none"
                  editable={accessToken ? false : true}
                />
                <CustomInput
                  iconName="lock"
                  iconSize={32}
                  value={values.password}
                  secureTextEntry
                  label="Password"
                  keyboardType="default"
                  placeholder="********"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  error={touched.password && errors.password}
                  type="password"
                />
                <CustomInput
                  iconName="lock"
                  iconSize={32}
                  value={values.confirmPassword}
                  secureTextEntry
                  label="Confirm Password"
                  keyboardType="default"
                  placeholder="********"
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  error={touched.confirmPassword && errors.confirmPassword}
                  type="password"
                />

                <CustomButton
                  buttonDisabled={buttonDisabled}
                  handleSubmit={handleSubmit}
                  submitting={isSubmitting}
                  label="SIGN UP"
                />
              </View>
            );
          }}
        </Formik>
        <View style={{ alignItems: "center" }}>
          <CustomButton
            buttonDisabled={false}
            handleSubmit={
              accessToken
                ? getUserData
                : () => {
                    promptAsync({ showInRecents: true });
                  }
            }
            submitting={false}
            label={accessToken ? "GET USER DATA" : "SIGN UP WITH GOOGLE"}
            style={{ backgroundColor: "red" }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    backgroundColor: "white",
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  formContentContainer: {
    flex: 1,
    // backgroundColor: "pink",
  },

  inputsContainer: {
    flex: 1,
    // marginTop: height * 0.08,
    // marginBottom: height * 0.08,
    // backgroundColor: "pink",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonContainer: {
    width: "80%",
    marginTop: 20,
    borderRadius: 15,
    alignItems: "center",
    backgroundColor: 10,
    padding: 15,

    backgroundColor: Colors.accentColor,
  },
  button: {
    borderRadius: 10,
  },
});

export default SignupScreen;
