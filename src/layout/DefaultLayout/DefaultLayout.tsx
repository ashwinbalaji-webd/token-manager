import { Layout, Space } from "antd";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../../pages/Login/Login";
import TokenManager from "../../pages/TokenManager/TokenManager";
import Navbar from "../../components/Navbar/Navbar";

const { Header, Footer, Content } = Layout;

const DefaultLayout: React.FC = () => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Layout className="cls-layout-container">
        <Header>Header</Header>
        <Content>
          <BrowserRouter>
            <Routes>
              <Route path="/dashboard" element={<TokenManager />} />
              <Route path="/tokenManager" element={<TokenManager />} />
              <Route path="/report" element={<TokenManager />} />
            </Routes>
          </BrowserRouter>
        </Content>
        <Footer>
          <Navbar />
        </Footer>
      </Layout>
    </Space>
  );
};

export default DefaultLayout;
