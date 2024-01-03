import { useContext } from "react"
import { CommonContext , CommonContextType } from "../context/CommonContext"

export const useCommonContext = () => {
  const context = useContext(CommonContext)

  if(!context) {
    throw Error('useCommonContext() must be used inside an CommonContextProvider')
  }

  return context as CommonContextType;
}