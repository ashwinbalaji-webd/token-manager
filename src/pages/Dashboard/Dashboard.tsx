import {
  Button,
  Card,
  Col,
  Row,
  Select,
  Statistic,
} from "antd";
import "./Dashboard.scss";
import PrimaryHeading from "../../components/PrimaryHeading/PrimaryHeading";
import { useEffect, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { useDocuments } from "../../hooks/useDocuments";
import { useCommonContext } from "../../hooks/useCommonContext";
import EmployeeHandlerModal from "../../components/EmployeeHandlerModal/EmployeeHandlerModal";
import CountUpFormatter from "../../components/CountUp/CountUp";
import Loader from "../../components/Loader/Loader";

interface Employee {
  emp_id: string;
  name: string;
  red: string;
}

const Dashboard: React.FC = () => {
  const { documents: employees } = useCollection<Employee>("employees");
  const { documents: config } = useCollection<Employee>("config");
  const { dispatch } = useCommonContext();

  const [selectedFilter, setSelectedFilter] = useState<string>("today");
  const { documents: tokens, isPending } = useDocuments('tokens' ,selectedFilter);
  const [tokensCount, setTokensCount] = useState<number>(0);

  const timeFilterChangeHandler = (value: string) => {
    setSelectedFilter(value);
  };

  useEffect(()=>{
    if(Object.keys(config).length){
      dispatch({ type: "CONFIG", payload: config});
    }
  },[config])

  /* MODAL */
  const showModalHandler = () => {
    dispatch({ type: "SHOW_MODAL", payload: true });
  };

  let [loading , setLoading] = useState(true);

  useEffect(() => {
    if (!isPending) {
      setLoading(false)
      const count = tokens.reduce((accumulator: number, token: any) => {

        return accumulator + (token.data.employees).length;
      }, 0);

      setTokensCount(count);
    }
  }, [tokens , isPending]);

  return (
    loading ? <Loader/> : 
    <>
      <Row className="cls-dashboard-container">
        <Col span={24}>
          <PrimaryHeading heading="Dashboard" />
        </Col>
        <Col span={24} className="cls-description">
          Effortlessly manage employee tokens issued by corporate companies for
          canteen purchases. Keep track of token distribution, usage, and
          reports for specific month ranges with ease. Simplify your token
          management process today!
        </Col>
        <Col span={24}>
          {employees && (
            <Row className="cls-statistics" gutter={12}>
              <Col span={24}>
                <Row className="cls-actions" justify="space-between">
                  <Col>
                    <Button
                      onClick={showModalHandler}
                      icon={<UserAddOutlined />}
                    >
                      Employee <UserDeleteOutlined />
                    </Button>
                  </Col>
                  <Col>
                    <Select
                      defaultValue="today"
                      style={{ width: 120 }}
                      onChange={timeFilterChangeHandler}
                      options={[
                        { value: "today", label: "Today" },
                        { value: "yesterday", label: "Yesterday" },
                        { value: "this week", label: "This Week" },
                        { value: "last week", label: "Last Week" },
                        { value: "this month", label: "This Month" },
                        { value: "last month", label: "Last Month" },
                        { value: "this year", label: "This Year" },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="Employees"
                    // value={employees.length}
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                    formatter={() => <CountUpFormatter value={employees.length} />}
                    // prefix={<ArrowUpOutlined />}
                    // suffix="%"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="Tokens"
                    // value={tokensCount}
                    precision={2}
                    valueStyle={{ color: "#cf1322" }}
                    formatter={() => <CountUpFormatter value={tokensCount} />}
                    // prefix={<ArrowDownOutlined />}
                    // suffix="%"
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      <EmployeeHandlerModal />
    </>
  );
};

export default Dashboard;
