import CountUp from "react-countup";

const CountUpFormatter = ({value} : {value : number}) => <CountUp end={value} separator="," />;

export default CountUpFormatter;