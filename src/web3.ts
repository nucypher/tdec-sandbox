import { Rinkeby } from "@usedapp/core";

export const WEB3_PROVIDER_URL =
  "https://hardworking-clean-gas.rinkeby.discover.quiknode.pro/17628d541fafc8312c89998c94610cf3c76613de/";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const addAltRinkebyNetwork = async () => {
  const provider = window.ethereum;
  if (!provider) {
    return;
  }
  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: Rinkeby.chainId,
          chainName: "Alt Rinkeby",
          rpcUrls: [WEB3_PROVIDER_URL],
          blockExplorerUrls: ["https://rinkeby.etherscan.io"],
          nativeCurrency: {
            symbol: "RinkebyETH",
            decimals: 18,
          },
        },
      ],
    });
  } catch (addError) {
    console.log(addError);
  }
};
