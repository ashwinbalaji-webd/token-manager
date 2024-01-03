import React, { useEffect, useState } from "react";
import { Button, Checkbox, Col, Form, Input, Row, Switch, message } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import "./AuthForm.scss";

import { useLogin } from "../../hooks/useLogin";
import { useSignup } from "../../hooks/useSignup";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogout } from "../../hooks/useLogout";

type FieldType = {
  email: string;
  password: string;
  remember?: string;
};

const AuthForm: React.FC = () => {
  const [isLoginForm, setIsLoginForm] = useState<boolean>(true);
  const { signupError, signup } = useSignup();
  const { loginError, login } = useLogin();

  // const { user } = useAuthContext();

  const validateMessages = {
    required: "${label} is required!",
    types: {
      email: "${label} is not a valid email!",
      password: "${label} is not a valid password!",
    },
  };

  const onFinish = (values: FieldType) => {
    isLoginForm
      ? login(values.email, values.password)
      : signup(values.email, values.password);
  };

  const formChangeHandler = (checked: boolean) => setIsLoginForm(!checked);

  const getErrorMessage = (errorMessage: string) => {
    const match = errorMessage.match(/\/(.*?)\)/);
    if (match) {
      const extractedMessage = match[1];
      return (
        extractedMessage.charAt(0).toUpperCase() +
        extractedMessage.slice(1).toLowerCase().replace(/-/g, " ") +
        "!"
      );
    } else {
      return isLoginForm ? "Invalid Credentials!" : "Error signing in!";
    }
  };

  useEffect(()=>{
    loginError && message.error(getErrorMessage(loginError));
  },[loginError])

  useEffect(()=>{
    signupError && message.error(getErrorMessage(signupError));
  },[signupError])

  return (
    <Row justify="center" align="middle" className="cls-authForm-container">
      <Col xs={{ span: 18 }} span={24}>
        <Form
          className="cls-authForm"
          name="basic"
          layout="vertical"
          // initialValues={{ remember: isLoginForm }}
          onFinish={onFinish}
          validateMessages={validateMessages}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[{ type: "email", required: true }]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              type="email"
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[
              {
                validator: (_, value) => {
                  if (value && value.length < 8 && !isLoginForm) {
                    return Promise.reject("Password must be greater than 8");
                  } else if (!value) {
                    return Promise.reject("Please input your password!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Row justify="end">
            {/* <Col>
              {isLoginForm && (
                <Form.Item<FieldType> name="remember" valuePropName="checked">
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              )}
            </Col> */}
            <Col>
              <Form.Item valuePropName="switched">
                <Switch
                  checkedChildren="Login"
                  unCheckedChildren="Sign up"
                  checked={!isLoginForm}
                  onChange={formChangeHandler}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="center">
            <Col>
              <Form.Item>
                <Button
                  className="cls-auth-btn"
                  type="primary"
                  size="large"
                  htmlType="submit"
                >
                  {isLoginForm ? "Login" : "Signup"}
                </Button>
              </Form.Item>
            </Col>
          </Row>
          {/* {signupError && <p>{signupError}</p>} */}
          {/* {loginError && message.error(loginError)} */}
        </Form>
      </Col>
    </Row>
  );
};

export default AuthForm;
