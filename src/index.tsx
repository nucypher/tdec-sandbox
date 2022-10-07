import React from "react";
import { StrictMode } from "react";
import * as ReactDOMClient from "react-dom/client";
import { DAppProvider, Config, Rinkeby } from "@usedapp/core";

import App from "./App";

const PROVIDER_URL =
  'https://hardworking-clean-gas.rinkeby.discover.quiknode.pro/17628d541fafc8312c89998c94610cf3c76613de/'

const config: Config = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: PROVIDER_URL,
  },
  networks: [Rinkeby],
}

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
