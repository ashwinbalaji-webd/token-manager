import PrimaryHeading from "../../components/PrimaryHeading/PrimaryHeading";
import "./Report.scss";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Col,
  DatePicker,
  DatePickerProps,
  Row,
  Statistic,
} from "antd";
import { useEffect, useState } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import CountUpFormatter from "../../components/CountUp/CountUp";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useCollection } from "../../hooks/useCollection";
import Loader from "../../components/Loader/Loader";
import { useCommonContext } from "../../hooks/useCommonContext";

type reportData = {
  employees: any[];
  timestamp: any;
};

interface Employee {
  emp_id: string;
  name: string;
  ref: string;
}

const monthFormat = "YYYY/MM";

const Report: React.FC = () => {
  const { getDocumentByMonth, getDocumentByRef } = useFirestore();
  const [currentMonthYear, setCurrentMonthYear] = useState<string>();
  const [today, setToday] = useState(new Date());
  const [year, setYear] = useState<any>();
  const [month, setMonth] = useState<any>();

  const [reportData, setReportData] = useState<reportData[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const {
    documents: employees,
    isCollectionPending,
    error,
  } = useCollection<Employee>("employees");
  const { documents: config } = useCollection<any>("config");

  useEffect(() => {
    setYear(today.getFullYear());
    setMonth(today.toLocaleString("default", { month: "long" }));
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    setCurrentMonthYear(`${currentYear}/${currentMonth}`);
  }, [today]);

  const monthChangeHandler: DatePickerProps["onChange"] = async (
    date,
    dateString
  ) => {
    if (date) {
      const selectedDateObject = new Date(dateString);
      const fullMonthName = selectedDateObject.toLocaleDateString(undefined, {
        month: "long",
      });
      setMonth(fullMonthName);
      setYear(date.year());
      const result: any = await getDocumentByMonth(date);
      console.log(result);
      setReportData(result ? result : []);
    }
  };

  useEffect(() => {
    (async function () {
      const result: any = await getDocumentByMonth(
        dayjs(currentMonthYear, monthFormat)
      );
      result && setReportData(result);
    })();
  }, [currentMonthYear]);

  useEffect(() => {
    (async function () {
      if (reportData.length) {
        const tokensGiven = reportData.reduce((accumulator, data) => {
          return accumulator + data.employees.length;
        }, 0);
        setTotalTokens(tokensGiven);
      } else {
        setTotalTokens(0);
      }
    })();
  }, [reportData]);

  const getFormattedDate = (timestamp: any) => {
    const jsDate = new Date(timestamp.seconds * 1000);
    const day = jsDate.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[jsDate.getMonth()];
    return `${day}-${monthName}`;
  };

  let disburse: number = 0;
  const prepareDataToDownload = async () => {
    let preparedData: any = [];

    await Promise.all(
      employees.map(async (employee: Employee, index: number) => {
        let employeeData: any = {
          "S.No": `${index + 1}`,
          "Employee ID": employee.emp_id,
          "Employee Name": employee.name,
        };
        await Promise.all(
          reportData.map(async (report) => {
            const date = getFormattedDate(report.timestamp);
            employeeData[date] = "-";
            await Promise.all(
              report.employees.map(async (emp) => {
                const empData: any = await getDocumentByRef(emp);
                if (
                  empData &&
                  employee.emp_id.toUpperCase() === empData.emp_id.toUpperCase()
                ) {
                  employeeData[date] = `${config.tokenAmount}`;
                  disburse += config.tokenAmount;
                }
              })
            );
          })
        );
        preparedData.push(employeeData);
      })
    );
    return preparedData;
  };

  const prepareTotalData = (dynamicDateColumns: string[]) => {
    const totalString: any = {};
    for (let i = 0; i < dynamicDateColumns.length - 2; i++) {
      totalString[dynamicDateColumns[i]] = " ";
    }
    const targetIndex1 = dynamicDateColumns[dynamicDateColumns.length - 2];
    const targetIndex2 = dynamicDateColumns[dynamicDateColumns.length - 1];
    totalString[targetIndex1] = "Total";
    totalString[targetIndex2] = `${disburse}`;
    console.log(totalString);
    return totalString;
  };

  const handleDownload = async () => {
    let excelData: any = await prepareDataToDownload();
    const workbook = XLSX.utils.book_new();

    // Setting dynamic-headers(dates) manually
    let dynamicDateColumns = Object.keys(excelData[0]).filter(
      (key) => !["S.No", "Employee ID", "Employee Name"].includes(key)
    );
    dynamicDateColumns = dynamicDateColumns.sort(dateComparator);
    const totalString = prepareTotalData(dynamicDateColumns);
    excelData.push(totalString);
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["S.No", "Employee ID", "Employee Name", ...dynamicDateColumns],
      ...excelData.map((obj: any) => [
        obj["S.No"],
        obj["Employee ID"],
        obj["Employee Name"],
        ...dynamicDateColumns.map((excelData: any) => obj[excelData] || 0),
      ]),
    ]);

    // Setting custom column headers width
    worksheet["!cols"] = [
      { wch: 5 }, // (S.No)
      { wch: 12 }, // (Employee ID)
      { wch: 20 }, // (Employee Name)
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `TMReport-${month}${year}`
    );

    XLSX.writeFile(workbook, `TMReport-${month}${year}.xlsx`);
  };

  const dateComparator = (a: string, b: string): number => {
    const dateA = new Date(a.replace("-", " "));
    const dateB = new Date(b.replace("-", " "));
    return dateA.getTime() - dateB.getTime();
  };

  return isCollectionPending ? (
    <Loader />
  ) : (
    <Row className="cls-report-container">
      <Col span={24}>
        <PrimaryHeading heading="Reports" />
      </Col>
      <Col span={24}>
        <Row className="cls-month-picker" align="middle">
          <Col>Selected Month : </Col>
          <Col>
            {currentMonthYear && (
              <DatePicker
                defaultValue={dayjs(currentMonthYear, monthFormat)}
                format={monthFormat}
                picker="month"
                onChange={monthChangeHandler}
              />
            )}
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Card bordered={false}>
          <Row
            justify="space-between"
            align="middle"
            className="cls-card-header"
          >
            <Col>
              {month} - {year}
            </Col>
            <Col>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                danger
                onClick={handleDownload}
              >
                Download
              </Button>
            </Col>
          </Row>
          {reportData && (
            <>
              <Card className="cls-statistics-card">
                <Row
                  justify="space-between"
                  className="cls-statistics-container"
                >
                  <Col>
                    <Statistic
                      title="Active Days"
                      value={reportData?.length}
                      formatter={() => (
                        <CountUpFormatter value={reportData.length} />
                      )}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Total tokens"
                      formatter={() => <CountUpFormatter value={totalTokens} />}
                      suffix={`* ${config.tokenAmount}`}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Amount"
                      formatter={() => (
                        <CountUpFormatter
                          value={totalTokens * config.tokenAmount}
                        />
                      )}
                      prefix="₹"
                    />
                  </Col>
                </Row>
              </Card>
              <Row justify="end" className="cls-download"></Row>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Report;
