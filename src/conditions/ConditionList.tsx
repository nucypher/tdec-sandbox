import { ConditionSet, Conditions } from "@nucypher/nucypher-ts";
import React from "react";

import { ConditionBuilder } from "./ConditionBuilder";

interface Props {
  conditions?: ConditionSet;
  setConditions: (value: ConditionSet) => void;
}

export const ConditionList = ({
  conditions,
  setConditions,
}: Props) => {
  const enableOperator =
    (conditions && conditions.conditions.length > 0) || false;

  const addConditions = (newConditions: Array<Record<string, string>>) => {
    const existingConditions = conditions ? conditions.conditions : [];
    const updatedConditions = [...existingConditions, ...newConditions] as any; // TODO: Fix this type cast
    const updatedContitionSet = new ConditionSet(updatedConditions);
    setConditions(updatedContitionSet);
  };

  // TODO: Use proper types instead of `unknown` once namespaces in `nucypher-ts` are fixed
  const Condition = (cond: unknown) => {
    if (cond instanceof Conditions.Condition) {
      return JSON.stringify(cond.value, null, 2);
    }
    return JSON.stringify(cond, null, 2);
  };

  const ConditionList = conditions ? (
    <div>
      <h3>Condition JSON Preview</h3>
      <pre>
        {conditions.conditions.map((condition, index) => (
          <div key={index}>{Condition(condition)}</div>
        ))}
      </pre>
    </div>
  ) : (
    <></>
  );

  return (
    <>
      <h2>Step 1 - Create A Condition Based Policy</h2>
      <div>
        <ConditionBuilder
          addConditions={addConditions}
          enableOperator={enableOperator}
        />
        {ConditionList}
      </div>
    </>
  );
};
