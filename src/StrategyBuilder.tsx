import React, { useState } from "react";
import { Mumbai, Rinkeby, useEthers } from "@usedapp/core";
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
      porterUri: "https://porter.nucypher.community",
    };
    // const goodUrsulas = ["0xCe692F6fA86319Af43050fB7F09FDC43319F7612"];
    const cohort = await Cohort.create(
      cohortConfig
      // goodUrsulas as unknown[] as never[] // TODO: remove after updating nucypher-ts
    );
    console.log("Created cohort: ", cohort);
    return cohort;
  };

  const deployStrategy = async () => {
    setLoading(true);
    await switchNetwork(Mumbai.chainId);
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const cohort = await makeCohort();
    const strategy = Strategy.create(
      cohort,
      new Date(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    );
    console.log("Created strategy: ", strategy);

    const deployedStrategy = await strategy.deploy("test", web3Provider);
    setDeployedStrategy(deployedStrategy);
    console.log("Deployed Strategy: ", deployedStrategy);

    await switchNetwork(Rinkeby.chainId);
    setLoading(false);
  };

  return (
    <div>
      <h2>Build Strategy</h2>
      <label htmlFor="thresholds">Select Threshold:</label>
      <input
        id="thresholds"
        type="number"
        defaultValue={1}
        onChange={(e) => setThreshold(parseInt(e.currentTarget.value))}
      />
      <label htmlFor="shares">Select Shares:</label>
      <input
        id="shares"
        type="number"
        defaultValue={1}
        onChange={(e) => setShares(parseInt(e.currentTarget.value))}
      />
      <button onClick={deployStrategy}>Deploy Strategy</button>
    </div>
  );
};
