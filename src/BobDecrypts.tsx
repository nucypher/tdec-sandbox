import { MessageKit } from "@nucypher/nucypher-ts";
import React, { useState } from "react";

interface Props {
  enabled: boolean;
  decrypt: (ciphertext: MessageKit) => void;
  decryptedMessage: string;
}

export const BobDecrypts = ({ decrypt, decryptedMessage, enabled }: Props) => {
  const [ciphertext, setCiphertext] = useState("");

  if (!enabled) {
    return <></>;
  }

  const onDecrypt = () => {
    const b64decoded = Buffer.from(ciphertext, "base64");
    decrypt(MessageKit.fromBytes(b64decoded));
  };

  const DecryptedMessage = () => {
    if (!decryptedMessage) {
      return <></>;
    }
    return (
      <>
        <h3>Decrypted Message:</h3>
        <p>{decryptedMessage}</p>
      </>
    );
  };

  return (
    <div>
      <h2>Step 3 - Decrypt Encrypted Message</h2>
      <input
        value={ciphertext}
        placeholder="Enter encrypted message"
        onChange={(e) => setCiphertext(e.currentTarget.value)}
      />
      <button onClick={onDecrypt}>Decrypt</button>
      {DecryptedMessage()}
    </div>
  );
};
