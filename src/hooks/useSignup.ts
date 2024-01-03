import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

// firebase imports
import { auth } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const useSignup = () => {
  const [signupError, setError] = useState<any>(null);
  const { dispatch } = useAuthContext();

  const signup = (email: string, password: string) => {
    setError(null);
    createUserWithEmailAndPassword(auth, email, password)
      .then((response) => {
        console.log("user signed up: ", response.user);
        dispatch({ type: "LOGIN", payload: response.user });
      })
      .catch((err) => {
        const errorMessage = err.message.split("Firebase: ")[1];
        setError(errorMessage);
      });
  };

  return { signupError, signup };
};
