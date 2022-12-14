import { Operator, Conditions, Condition } from "@nucypher/nucypher-ts";
import { Goerli, useEthers } from "@usedapp/core";
import React, { useState } from "react";

interface Props {
  addConditions: (conditions: Array<Record<string, string>>) => void;
  enableOperator: boolean;
}

export const ConditionBuilder = ({ addConditions, enableOperator }: Props) => {
  const { library } = useEthers();

  if (!library) {
    return null;
  }

  const LOGICAL_OPERATORS = [Conditions.AND.operator, Conditions.OR.operator];
  const CONDITION_TYPES = [
    Conditions.TimelockCondition.CONDITION_TYPE,
    Conditions.EvmCondition.CONDITION_TYPE,
    Conditions.RpcCondition.CONDITION_TYPE,
  ];
  const { COMPARATOR_OPERATORS } = Condition;
  const { RPC_METHODS } = Conditions.RpcCondition;
  const {
    STANDARD_CONTRACT_TYPES,
    METHODS_PER_CONTRACT_TYPE,
    PARAMETERS_PER_METHOD,
  } = Conditions.EvmCondition;

  const [logicalOperator, setLogicalOperator] = useState(LOGICAL_OPERATORS[0]);
  const [conditionType, setConditionType] = useState(CONDITION_TYPES[0]);
  const [comparator, setComparator] = useState(COMPARATOR_OPERATORS[0]);
  const [rpcMethod, setRpcMethod] = useState(RPC_METHODS[0]);
  const [standardContractType, setStandardContractType] = useState(
    STANDARD_CONTRACT_TYPES[0]
  );
  const [contractMethod, setContractMethod] = useState(
    METHODS_PER_CONTRACT_TYPE[standardContractType][0]
  );
  const [contractMethodParameters, setContractMethodParameters] = useState(
    PARAMETERS_PER_METHOD[contractMethod][0]
  );
  const [returnValueTest, setReturnValueTest] = useState(0);
  const [parameterValue, setParameterValue] = useState(
    undefined as string | undefined
  );
  const [contractAddress, setContractAddress] = useState("");

  const makeDropdown = (
    items: readonly string[],
    onChange = (e: any) => console.log(e)
  ) => {
    const optionItems = items.map((elem, index) => (
      <option key={index} value={elem}>
        {elem}
      </option>
    ));
    return (
      <select onChange={(e) => onChange(e.target.value)}>{optionItems}</select>
    );
  };
  const onSetContractMethod = (method: string) => {
    setContractMethod(method);
  };

  const onSetRpcMethod = (method: string) => {
    setRpcMethod(method);
  };

  const LogicalOperatorDropdown = makeDropdown(
    LOGICAL_OPERATORS,
    setLogicalOperator
  );
  const ConditionTypeDropdown = makeDropdown(CONDITION_TYPES, setConditionType);
  const ComparatorDropdown = makeDropdown(COMPARATOR_OPERATORS, setComparator);
  const RpcMethodDropdown = makeDropdown(RPC_METHODS, onSetRpcMethod);
  const StandardContractTypeDropdown = makeDropdown(
    STANDARD_CONTRACT_TYPES,
    setStandardContractType
  );
  const ContractMethodDropdown = makeDropdown(
    METHODS_PER_CONTRACT_TYPE[standardContractType],
    onSetContractMethod
  );
  const ContractMethodParametersDropdown = makeDropdown(
    PARAMETERS_PER_METHOD[contractMethod],
    setContractMethodParameters
  );

  const makeInput = (onChange = (e: any) => console.log(e)) => (
    <input type="string" onChange={(e: any) => onChange(e.target.value)} />
  );

  const ReturnValueTestInput = makeInput(setReturnValueTest);
  const ParametersValueInput = makeInput(setParameterValue);
  const ContractAddressInput = makeInput(setContractAddress);

  const TimelockCondition = (
    <div style={{ display: "grid" }}>
      <h3>Timelock Condition</h3>
      <p>
        Return Value Test {ComparatorDropdown} Value {ReturnValueTestInput}{" "}
      </p>
      <p>
        <b>
          Timelock {comparator} {returnValueTest}
        </b>
      </p>
    </div>
  );
  const RpcCondition = (
    <div>
      <h3>RPC Method Condition</h3>
      <p>Method {RpcMethodDropdown}</p>
      <p>
        Parameters {ContractMethodParametersDropdown} Value{" "}
        {ParametersValueInput}
      </p>
      <p>
        Return Value Test {ComparatorDropdown} Value {ReturnValueTestInput}
      </p>
      <p>
        <b>
          RPC Method {rpcMethod}({parameterValue}) {comparator}{" "}
          {returnValueTest}
        </b>
      </p>
    </div>
  );
  const EvmCondition = (
    <div>
      <h3>EVM Condition</h3>
      <p>Contract Address {ContractAddressInput}</p>
      <p>Standard Contract Type {StandardContractTypeDropdown}</p>
      <p>Method {ContractMethodDropdown}</p>
      <p>
        Parameters {ContractMethodParametersDropdown} Value{" "}
        {ParametersValueInput}
      </p>
      <p>
        Return Value Test {ComparatorDropdown} Value {ReturnValueTestInput}{" "}
      </p>
      <p>
        <b>
          Contract {standardContractType}({contractAddress}) {contractMethod}(
          {contractMethodParameters}={parameterValue}) {comparator}{" "}
          {returnValueTest}
        </b>
      </p>
    </div>
  );

  const ComponentForConditionType = (type: string) => {
    switch (type) {
      case "timelock":
        return TimelockCondition;
      case "rpc":
        return RpcCondition;
      case "evm":
        return EvmCondition;
      default:
        return <h1>Select a condition type</h1>;
    }
  };

  const makeConditonForType = (type: string): Record<string, any> => {
    const chain = Goerli.chainId;
    switch (type) {
      case "timelock":
        return new Conditions.TimelockCondition({
          returnValueTest: {
            comparator,
            value: returnValueTest,
          },
        });
      case "rpc":
        return new Conditions.RpcCondition({
          chain,
          method: rpcMethod,
          parameters: [parameterValue],
          returnValueTest: {
            comparator,
            value: returnValueTest,
          },
        });
      case "evm":
        // TODO: Remove this workaround after introducing proper parsing in EvmCondition
        // eslint-disable-next-line no-case-declarations
        const parameters =
          contractMethod === "ownerOf" && parameterValue
            ? [parseInt(parameterValue, 10)]
            : [parameterValue];
        return new Conditions.EvmCondition({
          contractAddress,
          chain,
          standardContractType,
          method: contractMethod,
          parameters,
          returnValueTest: {
            comparator,
            value: returnValueTest,
          },
        });
      default:
        throw Error(`Unrecognized condition type ${conditionType}`);
    }
  };

  const addConditionAndMaybeOperator = (
    condition: Record<string, any> | Condition
  ) => {
    // TODO: Condition set is already a list of stuff, how do I manage?
    const conditionAndMaybeOperator = [];
    if (enableOperator) {
      conditionAndMaybeOperator.push(new Operator(logicalOperator));
    }
    conditionAndMaybeOperator.push(condition);
    addConditions(conditionAndMaybeOperator);
  };

  const onAddNewCondition = (e: any) => {
    e.preventDefault();
    const condition = makeConditonForType(conditionType);
    addConditionAndMaybeOperator(condition);
  };

  return (
    <form>
      {enableOperator && (
        <>
          <h3>Select Logical Operator</h3>
          {LogicalOperatorDropdown}
        </>
      )}
      <div>
        <h3>Build New Condition</h3>
        {ConditionTypeDropdown}

        {ComponentForConditionType(conditionType)}

        <button onClick={onAddNewCondition}>Add New</button>
      </div>
    </form>
  );
};
