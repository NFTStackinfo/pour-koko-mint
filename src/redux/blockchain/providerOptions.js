import WalletConnectProvider from '@walletconnect/web3-provider'
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

const infuraId = '33b0ff5b9ed642e6ab65c03b9a4be632'
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId
    }
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Pour koko",
      infuraId
    }
  },
};

export default providerOptions
