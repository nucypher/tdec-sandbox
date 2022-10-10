import React from "react";
import { StrictMode } from "react";
import * as ReactDOMClient from "react-dom/client";
import { DAppProvider, Config, Rinkeby } from "@usedapp/core";
import { WEB3_PROVIDER_URL } from "./web3";

import App from "./App";

const config: Config = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: WEB3_PROVIDER_URL,
  },
  networks: [Rinkeby],
};

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOMClient.createRoot(rootElement).render(
    <StrictMode>
      <DAppProvider config={config}>
        <App />
      </DAppProvider>
    </StrictMode>
  );
}
