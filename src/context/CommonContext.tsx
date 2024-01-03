import { createContext, useEffect, useReducer, useState } from "react";
import { useCollection } from "../hooks/useCollection";

interface Employee {
    emp_id: string;
    name: string;
    ref: string;
  }

export interface CommonContextType {
  employees: Employee[];
  showModal: boolean;
  config : {[key : string] : any},
  loader : boolean,
  dispatch: (action: any) => void;
}

export const CommonContext = createContext<CommonContextType>({
  employees: [],
  showModal:false,
  config : {},
  loader : false,
  dispatch: (action) => {
    console.log("Default dispatch function:", action);
  },
});

export const commonReducer = (state: any, action: any) => {
  switch (action.type) {
    case "EMPLOYEES":
      return { ...state, employees : action.payload };
    case "SHOW_MODAL":
      return { ...state, showModal : action.payload };
    case "CONFIG":
      return { ...state, config : action.payload};
    default:
      return state;
  }
};


export function CommonContextProvider({ children }: any) {

  const [state, dispatch] = useReducer(commonReducer, {
    employees: [],
    showModal: false, 
    loader : true
  });

  return (
    <CommonContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CommonContext.Provider>
  );
}
