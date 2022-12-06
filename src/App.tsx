import type {
  MessageKit,
  PolicyMessageKit,
  DeployedStrategy,
  ConditionSet,
} from "@nucypher/nucypher-ts";
import React, { useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";

import { ConditionList } from "./conditions/ConditionList";
import { Encrypt } from "./Encrypt";
import { Decrypt } from "./Decrypt";
import { StrategyBuilder } from "./StrategyBuilder";
import { Spinner } from "./Spinner";

export default function App() {
  const { activateBrowserWallet, deactivate, account } = useEthers();

  const [loading, setLoading] = useState(false);
  const [deployedStrategy, setDeployedStrategy] = useState<DeployedStrategy>();
  const [conditions, setConditions] = useState<ConditionSet>();
  const [encryptedMessage, setEncryptedMessage] = useState<MessageKit>();
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [decryptionErrors, setDecryptionErrors] = useState<string[]>([]);

  const encryptMessage = (plaintext: string) => {
    setLoading(true);
    deployedStrategy!.encrypter.conditions = conditions;
    const encryptedMessage =
      deployedStrategy!.encrypter.encryptMessage(plaintext);

    setEncryptedMessage(encryptedMessage);
    setLoading(false);
  };

  const decryptMessage = async (ciphertext: MessageKit) => {
    setLoading(true);
    setDecryptedMessage("");
    setDecryptionErrors([]);

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const conditionContext =
      deployedStrategy!.encrypter.conditions!.buildContext(web3Provider);

    const retrievedMessages = await deployedStrategy!.decrypter.retrieve(
      [ciphertext],
      conditionContext
    );
    const decryptedMessages = retrievedMessages.map((mk: PolicyMessageKit) => {
      if (mk.isDecryptableByReceiver()) {
        return deployedStrategy!.decrypter.decrypt(mk);
      }

      // If we are unable to decrypt, we may inspect the errors and handle them
      if (Object.values(mk.errors).length > 0) {
        const ursulasWithErrors: string[] = Object.entries(mk.errors).map(
          ([address, error]) => `${address} - ${error}`
        );
        setDecryptionErrors(ursulasWithErrors);
      } else {
        setDecryptionErrors([]);
      }
      return new Uint8Array([]);
    });

    setDecryptedMessage(new TextDecoder().decode(decryptedMessages[0]));
    setLoading(false);
  };

  if (!account) {
    return (
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
    <div>
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={deactivate}> Disconnect Wallet </button>
        {account && <p>Account: {account}</p>}
      </div>

      <StrategyBuilder
        setLoading={setLoading}
        setDeployedStrategy={setDeployedStrategy}
      />

      <ConditionList conditions={conditions} setConditions={setConditions} />

      <Encrypt
        enabled={!!conditions}
        encrypt={encryptMessage}
        encryptedMessage={encryptedMessage!}
      />

      <Decrypt
        enabled={!!encryptedMessage}
        decrypt={decryptMessage}
        decryptedMessage={decryptedMessage}
        decryptionErrors={decryptionErrors}
      />
    </div>
  );
}
