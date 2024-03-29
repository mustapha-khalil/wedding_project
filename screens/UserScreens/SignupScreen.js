import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { showMessage } from "react-native-flash-message";
import { Formik } from "formik";

import * as Google from "expo-auth-session/providers/google";
// import * as WebBrowser from "expo-web-browser";

import { signUp } from "../../store/actions/Auth";
import { URL } from "../../helpers/url";

import validationSchema from "./SignupSchema";
import Colors from "../../constants/Colors";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import DefaultText from "../../components/DefaultText";
import customBackArrow from "../../helpers/customBackArrow";
import customBackHandler from "./../../helpers/customBackHandler";
// envelope // lock

const height = Dimensions.get("window").height;
console.log("height ", height * 0.2);

const SignupScreen = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState();
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useLayoutEffect(() => {
    customBackArrow({ navigation, isSubmitting });
  }, [isSubmitting]);

  useEffect(() => {
    const backHandler = customBackHandler({ navigation, isSubmitting });

    return () => {
      console.log("useEffect returned");
      backHandler.remove();
    };
  }, [isSubmitting]);

  const dispatch = useDispatch();

  const handleSubmitForm = async (values, formikActions) => {
    // send to the server
    const { fullName, email, password } = values;

    // split the fullName
    const nameArray = fullName.split(" ");
    const arraySize = nameArray.length;
    console.log("full name ", nameArray);
    let first = nameArray[0];
    console.log("first ", first);
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
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <View style={styles.formContainer}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <CustomButton
            buttonDisabled={false}
            // handleSubmit={
            //   accessToken
            //     ? getUserData
            //     : () => {
            //         promptAsync({ showInRecents: true });
            //       }
            // }

            submitting={false}
            label={accessToken ? "GET USER DATA" : "SIGN UP WITH GOOGLE"}
            style={{
              backgroundColor: "red",
            }}
          />

          <View
            style={{
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <DefaultText styles={{ fontFamily: "open-sans-bold" }}>
              OR
            </DefaultText>
          </View>

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
                    // selectTextOnFocus={true}
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
        </ScrollView>
      </View>
    </SafeAreaView>
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
  },

  inputsContainer: {
    flex: 1,

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
