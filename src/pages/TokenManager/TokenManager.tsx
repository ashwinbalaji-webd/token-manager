import { useEffect, useState, useRef } from "react";

// styles
import "./TokenManager.scss";

import { useCollection } from "../../hooks/useCollection";
import {
  Button,
  Col,
  DatePicker,
  DatePickerProps,
  FloatButton,
  Input,
  Row,
  Table,
  message,
} from "antd";
import PrimaryHeading from "../../components/PrimaryHeading/PrimaryHeading";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { useCommonContext } from "../../hooks/useCommonContext";
import { useDocuments } from "../../hooks/useDocuments";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirestore } from "../../hooks/useFirestore";
import { formatDate } from "../../utils";
import Loader from "../../components/Loader/Loader";

interface Employee {
  emp_id: string;
  name: string;
  ref: string;
}

interface DataType {
  key: string;
  emp_id: string;
  name: string;
}

const { Search } = Input;

const TokenManager: React.FC = () => {
  const { documents: employees ,isCollectionPending } = useCollection<Employee>("employees");
  const {documents: config} = useCollection("config");
  const [searchValue, setSearchValue] = useState("");
  const [filteredEmployees, setFilteredEmployee] =
    useState<Employee[]>(employees);
  const [today, setToday] = useState(new Date());
  const {
    getDocumentReference,
    isPending,
    getDocumentByRef,
  } = useFirestore();
  const [dateString, setDateString] = useState<any>(new Date());
  const { addDocument, updateDocument, getDocumentByDate , deleteDocumentByDate } = useFirestore();

  console.log(employees)
  
  const columns: ColumnsType<DataType> = [
    {
      title: "Emp ID",
      dataIndex: "emp_id",
      key: "emp_id",
      render: (text) => <a>{text}</a>,
      width: "30%",
    },
    {
      title: "Emp Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "emp_id",
      key: "emp_id",
      width: "20%",
      render: (id) => (
        <>
          {tokenArr && tokenArr.includes(id) ? (
            <CheckCircleOutlined
              className="cls-token-given"
              onClick={() => tokenHandler(id)}
            />
          ) : (
            <CloseCircleOutlined
              className="cls-token-not-given"
              onClick={() => tokenHandler(id)}
            />
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    setFilteredEmployee(employees);
  }, [employees]);

  const [tokenArr, setTokenArr] = useState<string[] | null>(null);

  // Function to handle token selection process
  const tokenHandler = (selectedId: string) => {
    if (tokenArr && tokenArr.includes(selectedId)) {
      setTokenArr((oldArray) => {
        return (
          oldArray &&
          oldArray.filter((id) => {
            return selectedId !== id;
          })
        );
      });
    } else {
      setTokenArr((oldArray) => {
        return [...(oldArray || []), selectedId];
      });
    }
  };

  const updateTokensInDB = async () => {
    let empRefArr = [];
    if (tokenArr) {
      for (const employeeId of tokenArr) {
        const empRef = await getDocumentReference(
          "employees",
          "emp_id",
          employeeId
        );
        if (!isPending && empRef) {
          empRefArr.push(empRef);
        }
      }

      setReferenceArray(empRefArr);
    }
  };

  const deleteTokensInDb = async () =>{
    await deleteDocumentByDate('tokens' , dateString);
  }

  // const timestampToFilterBy = useDocuments('tokens')

  const setReferenceArray = async (references: any[]) => {
    if (dateString) {
      const today = formatDate(new Date(dateString));

      let yesterday: string | Date = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday = formatDate(yesterday);

      const ref = collection(db, "tokens");
      let q = query(
        ref,
        where("timestamp", ">", Timestamp.fromDate(new Date(yesterday))),
        where("timestamp", "<", Timestamp.fromDate(new Date(today)))
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const documentReference = querySnapshot.docs[0].ref;
        await updateDocument({
          docRef: documentReference,
          employeesRef: references,
        });
      } else {
        // Handle the case where no documents match the query
        console.log("No matching documents.");
        let thisDay = new Date(today);
        thisDay.setHours(0, 0, 0, 0);
        await addDocument("tokens", {
          timestamp: Timestamp.fromDate(thisDay),
          employeesRef: references,
        });
      }
    }
  };

  useEffect(() => {
    setDateString(formatDate(today));
  }, [today]);

  useEffect(() => {
    (async function () {
      try {
        let gotToken: any = await getDocumentByDate("tokens", dateString);
        let empIDs = await Promise.all(
          gotToken.employees.map(async (empRef: any) => {
            let emp: any = await getDocumentByRef(empRef);
            return emp.emp_id;
          })
        );
        setTokenArr(empIDs);
      } catch (error) {
        // Handle any errors that occur during the fetch here
        setTokenArr([]);
        // console.error("Error fetching data:", error);
      }
    })();

  }, [dateString]);

  useEffect(() => {
    if (tokenArr && tokenArr.length) {
      updateTokensInDB();
    } else {
      deleteTokensInDb();
    }
  }, [tokenArr]);

  const dateChangeHandler: DatePickerProps["onChange"] = (date, dateString) => {
    setDateString(date);
  };

  const onSearchHandler = (event: any) => {
    let value = event.target.value.toUpperCase();
    setSearchValue(value);

    const filtered = employees.filter((employee: Employee) => {
      return employee.emp_id.includes(value);
    });

    setFilteredEmployee(filtered);
  };

  return (
    isCollectionPending ? <Loader /> :
    <Row className="cls-tokenManager-container">
      <Col span={24}>
        <PrimaryHeading heading="Token Management" />
      </Col>
      <Col span={24}>
        <Row justify="space-between">
          <Col span={12}>
            <DatePicker
              onChange={dateChangeHandler}
              defaultValue={dayjs(today)}
            />
          </Col>
          <Col span={12}>
            <Search
              value={searchValue}
              placeholder="Employee ID"
              onChange={onSearchHandler}
              prefix={config.empIdPrefix}
              maxLength={5}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24} className="cls-table-container">
        <Table
          columns={columns}
          dataSource={filteredEmployees.map((employee: Employee) => ({
            ...employee,
            key: employee.emp_id,
          }))}
          pagination={false}
          size="small"
          scroll={{ y: 330 }}
        />
      </Col>
    </Row>
  );
};

export default TokenManager;
