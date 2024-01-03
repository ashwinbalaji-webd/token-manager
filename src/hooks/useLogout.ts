import { useAuthContext } from "./useAuthContext";

// firebase imports
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out!");
        dispatch({ type: "LOGOUT" });
      })
      .catch((err) => {
        const errorMessage = err.message.split("Firebase: ")[1];
        console.log(errorMessage);
      });
  };

  return { logout };
};
