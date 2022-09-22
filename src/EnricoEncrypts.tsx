import type { MessageKit } from "@nucypher/nucypher-ts";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface Props {
  enabled: boolean;
  encryptedMessage?: MessageKit;
  encrypt: (value: string) => void;
}

export const EnricoEncrypts = ({
  encrypt,
  encryptedMessage,
  enabled,
}: Props) => {
  if (!enabled) {
    return <></>;
  }

  const [plaintext, setPlaintext] = useState("plaintext");

  const onClick = () => encrypt(plaintext);

  const CiphertextContent = () => {
    if (!encryptedMessage) {
      return <></>;
    }

    const encodedEncryptedMessage = Buffer.from(
      encryptedMessage.toBytes()
    ).toString("base64");
    return (
      <div>
        <h3>Encrypted message:</h3>
        <pre className="encryptedMessage">{encodedEncryptedMessage}</pre>
        <CopyToClipboard text={encodedEncryptedMessage}>
          <button>Copy to clipboard</button>
        </CopyToClipboard>
      </div>
    );
  };

  return (
    <div>
      <h2>Step 2 - Set conditions and Encrypt a message</h2>
      <input
        type="string"
        value={plaintext}
        onChange={(e) => setPlaintext(e.currentTarget.value)}
      />
      <button onClick={onClick}>Encrypt</button>
      {CiphertextContent()}
    </div>
  );
};
