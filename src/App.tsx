import {
  makeTDecDecrypter,
  makeTDecEncrypter,
  Enrico,
  MessageKit,
  tDecDecrypter,
  PolicyMessageKit,
} from "@nucypher/nucypher-ts";
import React, { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import type { ConditionSet } from "@nucypher/nucypher-ts";
import { ethers } from "ethers";

import { ConditionList } from "./conditions/ConditionList";
import { EnricoEncrypts } from "./EnricoEncrypts";
import { BobDecrypts } from "./BobDecrypts";

declare let window: any;

export default function App() {
  const { activateBrowserWallet, deactivate, account, library } = useEthers();

  // tDec Entities
  const [encrypter, setEncrypter] = useState(undefined as Enrico | undefined);
  const [decrypter, setDecrypter] = useState(
    undefined as tDecDecrypter | undefined
  );

  const [conditions, setConditions] = useState(
    undefined as ConditionSet | undefined
  );

  // // Encrypt message vars
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [encryptedMessage, setEncryptedMessage] = useState(
    undefined as MessageKit | undefined
  );

  // // Decrypt message vars
  const [decryptionEnabled, setDecryptionEnabled] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState("");

  useEffect(() => {
    const porterUri = "https://porter-ibex.nucypher.community";
    const configLabel = "2-of-4-ibex";

    const make = async () => {
      const decrypter = await makeTDecDecrypter(configLabel, porterUri);
      const encrypter = await makeTDecEncrypter(configLabel);
      setDecrypter(decrypter);
      setEncrypter(encrypter);
    };
    make();
  }, []);

  const encryptMessage = (plaintext: string) => {
    if (!encrypter || !conditions) {
      return;
    }
    encrypter.conditions = conditions;
    const encryptedMessage = encrypter.encryptMessage(plaintext);

    setEncryptedMessage(encryptedMessage);
    setDecryptionEnabled(true);
  };

  const decryptMessage = async (ciphertext: MessageKit) => {
    if (!decrypter || !conditions || !library) {
      return;
    }

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const conditionContext = conditions.buildContext(web3Provider);

    // Simplified flow with automated error handling
    // const decryptedMessages = await decrypter.retrieveAndDecrypt(
    //   [ciphertext],
    //   conditionContext
    // );

    // More extensive flow with manual error handling
    const retrievedMessages = await decrypter.retrieve(
      [ciphertext],
      conditionContext
    );
    const decryptedMessages = retrievedMessages.map((mk: PolicyMessageKit) => {
      if (mk.isDecryptableByReceiver()) {
        return decrypter.decrypt(mk);
      }

      // If we are unable to decrypt, we may inspect the errors and handle them
      const errorMsg = `Not enough cFrags retrieved to open capsule ${mk.capsule}.`;
      if (Object.values(mk.errors).length > 0) {
        const ursulasWithErrors = Object.entries(mk.errors).map(
          ([address, error]) => `${address} - ${error}`
        );
        alert(
          `${errorMsg} Some Ursulas have failed with errors:\n${ursulasWithErrors.join(
            "\n"
          )}`
        );
      } else {
        alert(errorMsg);
      }
      return new Uint8Array();
    });

    setDecryptedMessage(new TextDecoder().decode(decryptedMessages[0]));
  };

  if (!account) {
    return (
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={deactivate}> Disconnect Wallet </button>
        {account && <p>Account: {account}</p>}
      </div>

      <ConditionList
        enabled={encryptionEnabled}
        conditions={conditions}
        setConditions={setConditions}
      />

      {conditions && (
        <>
          <EnricoEncrypts
            enabled={encryptionEnabled}
            encrypt={encryptMessage}
            encryptedMessage={encryptedMessage}
          />
          <BobDecrypts
            enabled={decryptionEnabled}
            decrypt={decryptMessage}
            decryptedMessage={decryptedMessage}
          />
        </>
      )}
    </div>
  );
}
