import React, { useState } from "react";
import { Mumbai, Goerli, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { Cohort, DeployedStrategy, Strategy } from "@nucypher/nucypher-ts";

interface Props {
  setDeployedStrategy: (strategy: DeployedStrategy) => void;
  setLoading: (loading: boolean) => void;
}

export const StrategyBuilder = ({ setDeployedStrategy, setLoading }: Props) => {
  const { switchNetwork } = useEthers();
  const [shares, setShares] = useState(1);
  const [threshold, setThreshold] = useState(1);

  const makeCohort = async () => {
    const cohortConfig = {
      threshold,
      shares,
      porterUri: "https://porter-lynx.nucypher.community"
    };
    const cohort = await Cohort.create(cohortConfig);
    console.log("Created cohort: ", cohort);
    return cohort;
  };

  const deployStrategy = async () => {
    setLoading(true);
    await switchNetwork(Mumbai.chainId);
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const cohort = await makeCohort();
    const strategy = Strategy.create(cohort);
    console.log("Created strategy: ", strategy);

    const deployedStrategy = await strategy.deploy("test", web3Provider);
    setDeployedStrategy(deployedStrategy);
    console.log("Deployed Strategy: ", deployedStrategy);

    await switchNetwork(Goerli.chainId);
    setLoading(false);
  };

  return (
    <div>
      <h2>Build Strategy</h2>
      <label htmlFor="thresholds">Select Threshold:</label>
      <input
        id="thresholds"
        type="number"
        defaultValue={2}
        onChange={(e) => setThreshold(parseInt(e.currentTarget.value))}
      />
      <label htmlFor="shares">Select Shares:</label>
      <input
        id="shares"
        type="number"
        defaultValue={3}
        onChange={(e) => setShares(parseInt(e.currentTarget.value))}
      />
      <button onClick={deployStrategy}>Deploy Strategy</button>
    </div>
  );
};
