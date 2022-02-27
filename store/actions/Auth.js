export const SET_TOKEN = "SET_TOKEN";
export const SIGNUP = "SIGNUP";
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const EDIT_PROFILE = "EDIT_PROFILE";
export const SWITCH_PROFILE = "SWITCH_PROFILE";
export const TOGGLE_USER_FAVORITE = "TOGGLE_USER_FAVORITE";

export const login = (email, password) => {
  // call the server here
  // get user info
  // get token
  return { type: SIGNUP, token: "token", userInfo: {} };
};

export const signUp = (userInfo) => {
  // call to the server here
  // send userInfo
  // get token
  return { type: LOGIN, token: "token", userInfo: userInfo };
};

export const editProfile = (newData) => {
  // call to the server here
  // send new info the server

  return { type: EDIT_PROFILE, newData: newData };
};

export const addFavorite = (hallId) => {
  return { type: TOGGLE_USER_FAVORITE, hallId: hallId };
};

export const logout = () => {
  return { type: LOGOUT };
};

export const switchProfile = () => {
  return { type: SWITCH_PROFILE };
};
