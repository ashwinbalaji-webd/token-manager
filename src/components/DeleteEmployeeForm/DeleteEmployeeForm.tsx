import { Button, Form, Input, message } from "antd";
import "./DeleteEmployeeForm.scss";
import { useFirestore } from "../../hooks/useFirestore";
import SearchEmployee from "../SearchEmployee/SearchEmployee";
import { useState } from "react";

type EmployeeFieldType = {
  employeeId: string;
  employeeName: string;
};

type OptionType = {
  employeeId: string;
  value: string;
  ref: string;
};

const DeleteEmployeeForm: React.FC = () => {
  const { deleteDocument } = useFirestore();
  const [deleteEmployeeForm] = Form.useForm();
  const [selectedEmployee, setSelectedEmployee] = useState<OptionType | null>(
    null
  );
  const [emptySearchField , setEmptySearchField] = useState<boolean>(false);
 
  const deleteEmployeeHandler = async () => {
    if (selectedEmployee) {
      await deleteDocument('employees' , 'emp_id' , selectedEmployee.employeeId);
      message.success('Employee deleted successfully!')
      setSelectedEmployee(null);
    }
    setEmptySearchField(!emptySearchField)
    deleteEmployeeForm.resetFields();
  };

  const handleSelectItem = (employee: OptionType) => {
    setSelectedEmployee(employee);
  };

  return (
    <>
      <Form
        name="add_employee_form"
        onFinish={deleteEmployeeHandler}
        form={deleteEmployeeForm}
      >
        <Form.Item getValueFromEvent={(e) => e.target.value.toUpperCase()}>
          <SearchEmployee onSelect={handleSelectItem} shouldEmpty = {emptySearchField} />
        </Form.Item>
        <Form.Item style={{ textAlign: "end" }}>
          <Button
            type="primary"
            key="submit"
            htmlType="submit"
            disabled={!selectedEmployee}
          >
            Delete
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default DeleteEmployeeForm;
