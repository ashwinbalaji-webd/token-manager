import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";

export const useDocuments = (
  c: string,
  filter: string = "today",
) => {
  const [documents, setDocuments] = useState<any>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  const getQueryByFilter = (period = filter) => {
    const ref = collection(db, c);
    const startOfPeriod = new Date();
    const endOfPeriod = new Date();
    startOfPeriod.setHours(0, 0, 0, 0);

    switch (period) {
      case "this year":
        startOfPeriod.setMonth(0, 1);
        return query(ref, where("timestamp", ">=", startOfPeriod));

      case "last month":
        startOfPeriod.setDate(1);
        startOfPeriod.setMonth(startOfPeriod.getMonth() - 1);

        endOfPeriod.setHours(23, 59, 59, 999);
        endOfPeriod.setDate(0);

        return query(
          ref,
          where("timestamp", ">=", startOfPeriod),
          where("timestamp", "<=", endOfPeriod)
        );

      case "this month":
        startOfPeriod.setDate(1);
        return query(ref, where("timestamp", ">=", startOfPeriod));

      case "last week":
        startOfPeriod.setDate(
          startOfPeriod.getDate() - startOfPeriod.getDay() - 7
        );

        endOfPeriod.setHours(23, 59, 59, 999);
        endOfPeriod.setDate(endOfPeriod.getDate() - endOfPeriod.getDay() - 1);

        return query(
          ref,
          where("timestamp", ">=", startOfPeriod),
          where("timestamp", "<=", endOfPeriod)
        );

      case "this week":
        startOfPeriod.setDate(startOfPeriod.getDate() - startOfPeriod.getDay());
        return query(ref, where("timestamp", ">=", startOfPeriod));

      case "yesterday":
        startOfPeriod.setDate(startOfPeriod.getDate() - 1);

        endOfPeriod.setHours(23, 59, 59, 999);
        endOfPeriod.setDate(endOfPeriod.getDate() - 1);

        return query(
          ref,
          where("timestamp", ">=", startOfPeriod),
          where("timestamp", "<=", endOfPeriod)
        );

      default: {
        //today
        // const timestamp = Timestamp.fromDate(date);
        endOfPeriod.setHours(23, 59, 59, 999);
        return query(
          ref,
          where("timestamp", ">=", startOfPeriod),
          where("timestamp", "<=", endOfPeriod)
        );
      }
    }
  };

  useEffect(() => {
    setIsPending(true);

    const q = getQueryByFilter();

    getDocs(q)
      .then((snapshots) => {
        const docs = snapshots.docs.map((doc) => ({
          ref: doc.id,
          data: doc.data(),
        }));

        setDocuments(docs);
        setIsPending(false);
      })
      .catch((error) => {
        setError(error);
        setIsPending(false);
      });
  }, [filter]);

  return {
    documents,
    isPending,
    error,
  };
};
