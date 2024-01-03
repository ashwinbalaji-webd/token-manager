import { useEffect, useState } from "react";
import "./SearchEmployee.scss";
import { AutoComplete, Col, Input, Row } from "antd";
import { useCommonContext } from "../../hooks/useCommonContext";
import { useCollection } from "../../hooks/useCollection";

interface Employee {
  emp_id: string;
  name: string;
  ref?: string;
}

interface SearchEmployeeType {
  shouldEmpty : boolean,
  onSelect: (value: OptionType) => void;
}

type OptionType = {
  employeeId : string,
  value : string,
  ref : string
}

const SearchEmployee: React.FC<SearchEmployeeType> = ({ onSelect , shouldEmpty }: any) => {
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<OptionType[]>([]);
  const { dispatch } = useCommonContext();
  const { documents: employees , isCollectionPending , error } = useCollection<Employee>("employees");

  // Custom validator function to check for special characters
  const validateInput = (rule: any, value: string, callbackFunc: Function) => {
    const specialCharacterRegex = /[^A-Za-z0-9\s]+/;
    if (specialCharacterRegex.test(value)) {
      callbackFunc("Special characters are not allowed.");
    } else {
      callbackFunc();
    }
  };

  useEffect(()=>{
    setSearchValue('');
  },[shouldEmpty])

  useEffect(()=>{ 
    const filteredEmployee: OptionType[] = employees.filter((employee : Employee) =>
      employee.emp_id.includes(searchValue.toUpperCase())
    ).map((emp : Employee) => ({employeeId : emp.emp_id ,value : emp.name , label : (
      <Row gutter={20}>
        <Col style={{color : '#092348'}}>{emp.name}</Col> : 
        <Col style={{color : '#a8a8a8'}}>{emp.emp_id}</Col>
      </Row>
    ), employeeName : emp.name , ref : emp.ref}));

    setOptions(filteredEmployee);
  },[searchValue , employees])

  const handleSearch = (value: any) => {
    setSearchValue(value.toUpperCase());
  };


  const handleSelect = (value: any) => {
    const selectOption = options.find((option) => option.value === value)
    setSearchValue(`${selectOption?.employeeId} : ${selectOption?.value}`);
    onSelect(selectOption);
  };

  return (
    <AutoComplete
      options={options}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder="Search by Employee ID"
      value={searchValue}
      maxLength={8}
    >
    </AutoComplete>
  );
};

export default SearchEmployee;
