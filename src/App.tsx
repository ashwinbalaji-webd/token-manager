import "./App.scss";

import { ConfigProvider, Layout, Space, Switch } from "antd";

import { themeToken } from "./assets/styles/antdTheme";
import { useAuthContext } from "./hooks/useAuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AuthForm from "./components/AuthForm/AuthForm";
import TokenManager from "./pages/TokenManager/TokenManager";
import Report from "./pages/Report/Report";
import Loader from "./components/Loader/Loader";
// import SmoothRender from 'react-smooth-render';

function App() {
  const { user, authIsReady } = useAuthContext();

  return (
    <div className="App">
      <ConfigProvider theme={themeToken}>
        {authIsReady ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Layout>
              {user && <Header />}
              <div
                className="container"
                style={{ height: user ? "77vh" : "100vh" }}
              >
                <Routes>
                  {user ? (
                    <>
                      (
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tokenManager" element={<TokenManager />} />
                      <Route path="/report" element={<Report />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />)
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<AuthForm />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </>
                  )}
                </Routes>
              </div>
              {user && <Navbar />}
            </Layout>
          </Space>
        ) : (
          <Loader />
        )}
      </ConfigProvider>
    </div>
  );
}

export default App;
