import { Button, Col, Form, Input, Row, Switch, Upload, message } from "antd";
import type { UploadProps } from "antd";
import "./AddEmployeeForm.scss";
import { useFirestore } from "../../hooks/useFirestore";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useCommonContext } from "../../hooks/useCommonContext";
import Loader from "../Loader/Loader";

type EmployeeFieldType = {
  employeeId: string;
  employeeName: string;
};

interface AddEmployeeFormType {
  resetAddForm: any;
}

type EmployeeBulkType = {
  "Employee ID": string;
  "Employee Name": string;
};

const AddEmployeeForm: React.FC<AddEmployeeFormType> = ({ resetAddForm }) => {
  const { isPending, addDocument, bulkInsertDocuments } = useFirestore();
  const [addEmployeeform] = Form.useForm();
  const [fileList, setFileList] = useState<any>([]);
  const [addFeatureType, setAddFeatureType] = useState("single");
  const [uploading, setUploading] = useState<boolean>(false);
  const { config } = useCommonContext();

  useEffect(() => {
    resetAddForm(addEmployeeform);
  }, [addEmployeeform]);

  const handleBulkUpload = () => {
    try {
      const file = fileList[0];
      const reader = new FileReader();
      reader.readAsBinaryString(file);

      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); //to get the headers
        const rows: EmployeeBulkType[] = XLSX.utils.sheet_to_json(worksheet);

        if (rows.length) {
          const expectedKeys = ["S.No", "Employee ID", "Employee Name"];
          const rowKeys = Object.keys(rows[1]);

          if (
            !expectedKeys.every((key) => rowKeys.includes(key)) ||
            rowKeys.length !== expectedKeys.length
          ) {
            message.error("Wrong data format!");
            return;
          }

          setUploading(true);
          const formattedData = rows.map((item: EmployeeBulkType) => ({
            employeeId: item["Employee ID"].toUpperCase(),
            employeeName: item["Employee Name"].toUpperCase(),
          }));

          // Call the bulkInsertDocuments function to insert the data
          await bulkInsertDocuments(formattedData);
          message.success("Bulk upload completed successfully!");
          setUploading(false);
          setFileList([]);
        } else {
          message.warning("Excel data is empty!");
          return;
        }
      };
    } catch (error: unknown) {
      setUploading(false);
      error instanceof Error
        ? message.error(error.message)
        : message.error("An error occurred during bulk upload.");
    }
  };

  const addEmployeeHandler = async (values: EmployeeFieldType) => {
    if (addFeatureType === "bulk") {
      if (fileList.length === 0) {
        message.error("Please select a file for upload.");
        return;
      }
      return handleBulkUpload();
    } else {
      const employeeId = values.employeeId;
      if (
        employeeId.slice(0, 3) === config.empIdPrefix.toUpperCase() &&
        parseInt(employeeId.slice(3)) &&
        employeeId.slice(3).length < 8
      ) {
        await addDocument("employees", values);
        message.success("Employee added successfully!");
        addEmployeeform.resetFields();
      } else {
        message.error("Invalid employee ID!");
      }
    }
  };

  // Custom validator function to check for special characters
  const validateInput = (rule: any, value: string, callbackFunc: Function) => {
    const specialCharacterRegex = /[^A-Za-z0-9\s]+/;
    if (specialCharacterRegex.test(value)) {
      callbackFunc("Special characters are not allowed.");
    } else {
      callbackFunc();
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    headers: {
      authorization: "authorization-text",
    },
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    accept: ".xlsx , .xls",
    onRemove: () => {
      setFileList([]);
      return true;
    },
  };

  const addTypeChangeHandler = (checked: boolean) => {
    setAddFeatureType(checked ? "bulk" : "single");
  };

  return (
    <>
      {!uploading ? (
        <Form
          name="add_employee_form"
          onFinish={addEmployeeHandler}
          form={addEmployeeform}
        >
          {addFeatureType === "single" ? (
            <Row>
              <Col span={24}>
                <Form.Item<EmployeeFieldType>
                  name="employeeId"
                  rules={[
                    { required: true, message: "Please input employee ID!" },
                    { max: 8, message: "Invalid employee ID!" },
                    { validator: validateInput },
                  ]}
                  initialValue={config?.empIdPrefix}
                  getValueFromEvent={(e) => e.target.value.toUpperCase()}
                >
                  <Input placeholder="ID" />
                </Form.Item>
                <Form.Item<EmployeeFieldType>
                  name="employeeName"
                  rules={[
                    { required: true, message: "Please input employee name!" },
                    { validator: validateInput },
                    {
                      min: 4,
                      message: "Name should be greater than 3 characters!",
                    },
                    {
                      max: 30,
                      message: "Name should not be greater than 50 characters!",
                    },
                  ]}
                  getValueFromEvent={(e) => e.target.value.toUpperCase()}
                >
                  <Input placeholder="Name" />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Row className="cls-bulk-form" justify="center">
              <Col>
                <Upload {...uploadProps} fileList={fileList}>
                  <Button icon={<UploadOutlined />}>Bulk Upload</Button>
                </Upload>
              </Col>
            </Row>
          )}
          <Row justify="space-between">
            <Col className="cls-bulk-upload-btn">
              <Switch
                checkedChildren="SINGLE"
                unCheckedChildren="BULK"
                onChange={addTypeChangeHandler}
              />
            </Col>
            <Col>
              <Form.Item>
                <Button type="primary" key="submit" htmlType="submit">
                  Add
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default AddEmployeeForm;
