import { Button, Row, Image, Col } from "antd";
import { useLogout } from "../../hooks/useLogout";
import "./Header.scss";
import { InfinitiLogo, ProductLogo } from "../../assets/icons";
import { LogoutOutlined } from "@ant-design/icons";

const Header: React.FC = () => {
  const { logout } = useLogout();
  return (
    <Row className="cls-header-container" justify="space-between" align='middle'>
      <Col>
        <InfinitiLogo />
      </Col>
      <Col>
        <Row align='middle' gutter={10}>
          <Col>
            <ProductLogo />
          </Col>
          <Col className="cls-logout-btn">
            <LogoutOutlined onClick={logout} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Header;
