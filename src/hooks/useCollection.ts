import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCommonContext } from "./useCommonContext";

interface CollectionType {
  ref?: string;
  name?: string;
  emp_id?: string;
}

export const useCollection = <T extends CollectionType>(
  c: string,
  q: string | null = null
) => {
  const [documents, setDocuments] = useState<any>([]);
  const [isCollectionPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sortEmployees = (employees: T[]) => {
    employees.sort(
      (a: any, b: any) =>
        parseInt(a.emp_id.split("ISS")[1]) - parseInt(b.emp_id.split("ISS")[1])
    );
    
    return employees;
  };
  
  useEffect(() => {
    setIsPending(true);
    let ref = collection(db, c);
    
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        let results: T[] = [];
        
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data()} as T);
        });
        
        if (results.length) {
          const docs = c === 'config' ? results[0] : c === 'employees' ? sortEmployees(results) : results;
          
          setIsPending(false);
          setDocuments(docs);
        }
      },
      (error) => {
        setIsPending(false);
        setError("Could not fetch the data");
      }
      );
      
    /* Unsubscribe the snapshot if component is unmounted while API service is on going,
       The result from the API will try to search for the component to render the result but since the component is unmounted, it cannot update. So that we have to unsubscribe or will throw error*/
    return () => unsubscribe();
  }, [c]);

  return { documents, isCollectionPending, error };
};
