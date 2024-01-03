import React, { useEffect, useState } from "react";
import { HomeFilled } from "@ant-design/icons";
import { Avatar, Col, Row, Segmented, Space } from "antd";
import { useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { DashboardMenuIcon, ReportMenuIcon } from "../../assets/icons";
import { useCommonContext } from "../../hooks/useCommonContext";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState("");
  const { dispatch } = useCommonContext();

  const menuChangeHandler = (menuName: string | number) => {
    console.log(`/${menuName}`);
    navigate(`/${menuName}`);
  };

  useEffect(() => {
    setCurrentPath(window.location.pathname.split("/")[1].trim());
  }, []);


  return (
    <Row className="cls-navbar-container">
      <Col span={24}>
        {currentPath && (
          <Segmented
            defaultValue={currentPath}
            onChange={menuChangeHandler}
            options={[
              {
                label: (
                  <div>
                    <HomeFilled />
                    <div>Home</div>
                  </div>
                ),
                value: "tokenManager",
              },
              {
                label: (
                  <div>
                    <DashboardMenuIcon />
                    <div>Dashboard</div>
                  </div>
                ),
                value: "dashboard",
              },
              {
                label: (
                  <div>
                    <ReportMenuIcon />
                    <div>Report</div>
                  </div>
                ),
                value: "report",
              },
            ]}
          />
        )}
      </Col>
    </Row>
  );
};

export default Menu;
