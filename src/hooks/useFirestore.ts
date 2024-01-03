import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";
import { db } from "../firebase/config";
import { formatDate } from "../utils";
import { EmployeeFieldType } from "../types";

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null,
};

const firestoreReducer = (state: any, action: any) => {
  switch (action.type) {
    case "IS_PENDING":
      return { isPending: true, document: null, success: false, error: null };
    case "ADDED_DOCUMENT":
      return {
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      };
    case "DELETED_DOCUMENT":
      return { isPending: false, document: null, success: true, error: null };
    case "ERROR":
      return {
        isPending: false,
        document: null,
        success: false,
        error: action.payload,
      };
    case "UPDATED_DOCUMENT":
      return {
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      };
    case "BULK_INSERT_SUCCESS":
      return {
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      };
    default:
      return state;
  }
};

export const useFirestore = () => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isPending, setIsPending] = useState<boolean>(false);

  const addDocument = async (c: string, d: EmployeeFieldType) => {
    dispatch({ type: "IS_PENDING" });

    const ref = collection(db, c);

    try {
      let addedDocument;

      if (c === "employees") {
        addedDocument = await addDoc(ref, {
          emp_id: d.employeeId,
          name: d.employeeName,
        });
      } else {
        addedDocument = await addDoc(ref, {
          timestamp: d.timestamp,
          employees: d.employeesRef,
        });
      }

      dispatch({
        type: "ADDED_DOCUMENT",
        payload: addedDocument,
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const bulkInsertDocuments = async (data: EmployeeFieldType[]) => {
    const batch = writeBatch(db);

    try {
      const ref = collection(db, "employees");

      data.forEach((d) => {
        const newDoc = doc(ref);
        batch.set(newDoc, {
          emp_id: d.employeeId,
          name: d.employeeName,
        });
      });

      await batch.commit();

      dispatch({
        type: "BULK_INSERT_SUCCESS",
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const updateDocument = async (d: EmployeeFieldType) => {
    dispatch({ type: "IS_PENDING" });

    try {
      let updatedDocument;
      updatedDocument = updateDoc(d.docRef, {
        employees: d.employeesRef,
      });

      dispatch({
        type: "ADDED_DOCUMENT",
        payload: updatedDocument,
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const deleteDocument = async (collectionName: string,
    fieldKey: string,
    fieldValue: any) => {
    try {
      const refValue = await getDocumentReference(
        collectionName,
        fieldKey,
        fieldValue
      );

      refValue && deleteDoc(refValue);

      dispatch({
        type: "DELETED_DOCUMENT",
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };


  const getDocumentByKeyValue = async (
    collectionName: string,
    fieldKey: string,
    fieldValue: any
  ) => {
    try {
      // setIsPending(true);
      dispatch({ type: "IS_PENDING" });

      const q: any = query(
        collection(db, collectionName),
        where(fieldKey, "==", fieldValue)
      );

      const querySnapshot = await getDoc(q);

      if (querySnapshot) {
        const document = querySnapshot.data();
        setIsPending(false);
        return document;
      } else {
        // Handle the case where no documents match the query
        console.log("No matching documents.");
        setIsPending(false);
        return null;
      }
    } catch (err: any) {
      setIsPending(false);
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const getDocumentByRef = async (ref: any) => {
    try {
      setIsPending(true);

      const docSnapshot = await getDoc(ref);

      if (docSnapshot) {
        const document = docSnapshot.data();
        setIsPending(false);
        return document;
      } else {
        // Handle the case where no documents match the query
        console.log("No matching document.");
        setIsPending(false);
        return null;
      }
    } catch (err: any) {
      setIsPending(false);
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const getDocumentReference = async (
    collectionName: string,
    fieldKey: string,
    fieldValue: any
  ) => {
    try {
      setIsPending(true);
      const q = query(
        collection(db, collectionName),
        where(fieldKey, "==", fieldValue)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const documentReference = querySnapshot.docs[0].ref;
        setIsPending(false);
        return documentReference;
      } else {
        // Handle the case where no documents match the query
        console.log("No matching documents.");
        setIsPending(false);
        return null;
      }
    } catch (err: any) {
      setIsPending(false);
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const getDocumentByDate = async (c: string, dateString: any) => {
    const ref = collection(db, c);
    try {
      setIsPending(true);
      const today = formatDate(new Date(dateString));

      let yesterday: string | Date = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday = formatDate(yesterday);

      let q = query(
        ref,
        where("timestamp", ">", Timestamp.fromDate(new Date(yesterday))),
        where("timestamp", "<", Timestamp.fromDate(new Date(today)))
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docs = querySnapshot.docs[0].data();
        setIsPending(false);
        return docs;
      } else {
        // Handle the case where no documents match the query
        console.log("No matching documents.");
        setIsPending(false);
        return null;
      }
    } catch (err: any) {
      // setError(err);
      dispatch({ type: "ERROR", payload: err.message });
      setIsPending(false);
    }
  };

  const deleteDocumentByDate = async (c: string, dateString: any) => {
    const ref = collection(db, c);
    try {
      setIsPending(true);
      const today = formatDate(new Date(dateString));

      let yesterday: string | Date = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday = formatDate(yesterday);

      let q = query(
        ref,
        where("timestamp", ">", Timestamp.fromDate(new Date(yesterday))),
        where("timestamp", "<", Timestamp.fromDate(new Date(today)))
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRefToDelete = querySnapshot.docs[0].ref;
        docRefToDelete && deleteDoc(docRefToDelete);
        setIsPending(false);
        dispatch({
          type: "DELETED_DOCUMENT",
        });
      } else {
        // Handle the case where no documents match the query
        console.log("No matching documents.");
        setIsPending(false);
        return null;
      }
    } catch (err: any) {
      dispatch({ type: "ERROR", payload: err.message });
      setIsPending(false);
    }
  };

  const getDocumentByMonth = async (monthString : any) =>{
    const ref = collection(db , 'tokens');  

    try{
      setIsPending(true);
      const startDate = monthString.startOf("month").toDate();
      const endDate = monthString.endOf("month").toDate();

      const q = query(
        ref,
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate),
        orderBy("timestamp", "asc")
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docs = querySnapshot.docs;
        const resultDocs = docs.map((document : any)=>{
          return document.data();
        })
        
        setIsPending(false);
        return resultDocs;
      } else {
        // Handle the case where no documents match the query
        console.log("No matching documents.");
        setIsPending(false);
        return null;
      }
    }
    catch(err : any){
      // setError(err);
      dispatch({ type: "ERROR", payload: err.message });
      setIsPending(false);
    }
  }

  return {
    // success,
    // error,
    isPending,
    getDocumentByRef,
    getDocumentByKeyValue,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentReference,
    getDocumentByDate,
    deleteDocumentByDate,
    bulkInsertDocuments,
    getDocumentByMonth
  };
};
