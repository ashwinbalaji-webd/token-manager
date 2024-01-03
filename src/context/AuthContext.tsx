import { createContext, useReducer, useEffect } from 'react'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

export interface AuthContextType {
  user: any; // replace 'any' with the actual user type.
  authIsReady: boolean;
  dispatch: (action: any) => void; // replace 'any' with the type of your actions.
}

export const AuthContext = createContext<AuthContextType>({
  user : null,
  authIsReady : false,
  dispatch: (action) => {
    console.log('Default dispatch function:', action);
  },
});

export const authReducer = (state : any, action : any) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'AUTH_IS_READY':
      return { user: action.payload, authIsReady: true }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children } : any) => {
  const [state, dispatch] = useReducer(authReducer, { 
    user: null,
    authIsReady: false
  })

  // To check an user is authenticated or not when landing the first page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth , user => {
      dispatch({ type: 'AUTH_IS_READY', payload: user })
      unsubscribe()
    })
  }, [])

  
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      { children }
    </AuthContext.Provider>
  )

}