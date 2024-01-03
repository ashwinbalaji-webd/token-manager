import './PrimaryHeading.scss';
import { Col, Row } from "antd"

interface HeadingProp {
    heading : string
}

const PrimaryHeading:React.FC<HeadingProp> = ({heading}) =>{
    return (
        <Row className="cls-primary-heading">
            <Col>{heading.length ? heading : 'PrimaryHeading'}</Col>
        </Row>
    )
}


export default PrimaryHeading