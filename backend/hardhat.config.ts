import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY.length > 0 ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: "YourApiKey", // Not needed for localhost, but required for public networks
    customChains: [
      {
        network: "localhost",
        chainId: 31337,
        urls: {
          apiURL: "http://127.0.0.1:8545",
          browserURL: "http://127.0.0.1:8545",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.28",
      },
    ],
  },
};

export default config;