import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

// firebase imports
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

export const useLogin = () => {
  const [loginError, setError] = useState<any>();
  const { dispatch } = useAuthContext();

  const login = (email: string, password: string) => {
    setError(null);
    signInWithEmailAndPassword(auth, email, password)
      .then((response) => {
        console.log("user logged in: ", response.user);
        dispatch({ type: "LOGIN" , payload: response.user});
      })
      .catch((err) => {
        const errorMessage = err.message.split("Firebase: ")[1];
        setError(errorMessage);
      });
  };

  return { loginError, login };
};
