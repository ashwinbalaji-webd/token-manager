import "./EmployeeHandlerModal.scss";
import { useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Switch } from "antd";
import { useFirestore } from "../../hooks/useFirestore";
import { useCommonContext } from "../../hooks/useCommonContext";
import AddEmployeeForm from "../AddEmployeeForm/AddEmployeeForm";
import DeleteEmployeeForm from "../DeleteEmployeeForm/DeleteEmployeeForm";

const EmployeeHandlerModal: React.FC = () => {
  const { showModal, dispatch } = useCommonContext();
  const [featureType, setFeatureType] = useState("add");
  const [resetAddForm, setresetAddForm] = useState<any>();

  const handleModalCancel = () => {
    resetAddForm && resetAddForm.resetFields();
    setFeatureType("add");
    dispatch({ type: "SHOW_MODAL", payload: false });
  };

  const typeChangeHandler = (checked: boolean) => {
    setFeatureType(checked ? "delete" : "add");
  };

  return (
    <Modal
      title={
        <Row justify="space-between" align="middle">
          <Col>{featureType == "add" ? "Add" : "Delete"} Employee</Col>
          <Col style={{ marginInlineEnd: "35px" }}>
            <Switch
              checked={featureType !== 'add'}
              checkedChildren="ADD"
              unCheckedChildren="DELETE"
              onChange={typeChangeHandler}
            />
          </Col>
        </Row>
      }
      open={showModal}
      onCancel={handleModalCancel}
      centered
      width={390}
      footer={[]}
    >
      {featureType == "add" ? (
        <AddEmployeeForm resetAddForm={setresetAddForm} />
      ) : (
        <DeleteEmployeeForm />
      )}
    </Modal>
  );
};

export default EmployeeHandlerModal;
