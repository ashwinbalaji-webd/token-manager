import { Col, Row, Spin } from "antd";

const Loader: React.FC = () => {
  return (
    <Row justify='center' align='middle' style={{height : '100%'}} className="cls-loader">
      <Col>
        <Spin spinning={true} size="large"></Spin>
      </Col>
    </Row>
  );
};

export default Loader;
