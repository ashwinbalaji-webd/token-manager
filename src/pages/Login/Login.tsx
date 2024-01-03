import "./Login.scss";
import AuthForm from "../../components/AuthForm/AuthForm";
import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);
  }, []);
  return (
    // <Row align='middle' justify="center" className="cls-login">
    // <Col sm={{span : 24}}>
    loading ? <Loader /> : <AuthForm />
    // </Col>
    // </Row>
  );
};

export default Login;
