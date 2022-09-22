import React from "react";
import { StrictMode } from "react";
import * as ReactDOMClient from "react-dom/client";
import { Mainnet, DAppProvider, Config, Rinkeby } from "@usedapp/core";
import { getDefaultProvider } from "ethers";

import App from "./App";

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider("mainnet"),
    [Rinkeby.chainId]: getDefaultProvider("rinkeby"),
  },
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
