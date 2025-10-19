//@ts-nocheck
import { ethers, parseUnits } from "ethers";
import { toast } from "react-toastify";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  encodeFunctionData,
  erc20Abi,
  http,
} from "viem";
import { providerToSmartAccountSigner } from "permissionless";
import { base } from "wagmi/chains";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";

import axios from "axios";
import {
  toMetaMaskSmartAccount,
  Implementation,
} from "@metamask/delegation-toolkit";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { encodeFunctionData, zeroAddress } from "viem";

const CA = "0x84B80AF2Dab6c148CC9f61c9fae9fabB5a5975b8";
const TA = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";
const API_ENDPOINT = `${import.meta.env.VITE_BACKEND_ENDPOINT}`;
const FEE_1 = 0.05;
const FEE_2 = 0.1;
const FEE_3 = 0.15;

const RE_APPROVAL_WAIT_PERIOD = 90 * 24 * 60 * 60 * 1000; // 3 months

interface Bank {
  name: string;
  type: string;
  code: string;
}

interface DataPoint {
  data: Bank;
  score: number;
}

const sentScore = (targetWord: string, word: string) => {
  const words = targetWord.toLowerCase().split("");
  let score = 0;
  words.forEach((letter) => {
    if (word.toLowerCase().includes(letter)) {
      score += 1;
    }
  });

  const cleanTarget = targetWord.toLowerCase().trim();
  const cleanWord = word.toLowerCase().trim();

  if (cleanTarget === cleanWord) return 100; // perfect match
  if (cleanWord.startsWith(cleanTarget)) return 90; // prefix match
  if (cleanWord.includes(cleanTarget)) return 70; // substring match
  for (const char of cleanTarget) {
    if (cleanWord.includes(char)) score += 1;
  }
  if (
    cleanTarget.split(" ").length < cleanWord.split(" ").length &&
    !cleanWord.includes(targetWord)
  ) {
    score -= targetWord.length;
  }

  return score;
};

const replaceBankNicknames = (input: string) => {
  let output = input;
  for (const [key, value] of Object.entries(bankNickName)) {
    const regex = new RegExp(`\\b${key}\\b`, "gi"); // match whole word, case-insensitive
    output = output.replace(regex, value);
  }
  return output;
};

const getClosestText = (target: string, textArray: Bank[]) => {
  const evalArray: DataPoint[] = [];
  textArray.forEach((el: Bank) => {
    evalArray.push({
      data: el,
      score:
        target.split(" ").length < el.name.split(" ").length
          ? sentScore(replaceBankNicknames(target.trimEnd()), el.name) - 5
          : sentScore(replaceBankNicknames(target.trimEnd()), el.name),
    });
  });

  return evalArray.sort((x, y) => {
    return y.score - x.score;
  });
};

const bankNickName = {
  gt: "Guaranty Trust Bank",
  uba: "United Bank of Africa",

  gtb: "Guaranty Trust Bank",
  gtbank: "Guaranty Trust Bank",

  ubank: "United Bank for Africa",
  zen: "Zenith Bank",
  zenith: "Zenith Bank",
  zenithbank: "Zenith Bank",
  access: "Access Bank",
  acc: "Access Bank",
  accessbank: "Access Bank",
  first: "First Bank of Nigeria",
  fbn: "First Bank of Nigeria",
  firstbank: "First Bank of Nigeria",

  fidelity: "Fidelity Bank",

  fcmbank: "First City Monument Bank",

  wema: "Wema Bank",
  wemabank: "Wema Bank",
  stanbic: "Stanbic IBTC Bank",
  stan: "Stanbic IBTC Bank",
  stanbicibtc: "Stanbic IBTC Bank",

  polaris: "Polaris Bank",
  skye: "Polaris Bank",
  skyebank: "Polaris Bank",

  union: "Union Bank",

  keystone: "Keystone Bank",

  heritage: "Heritage Bank",

  jaiz: "Jaiz Bank",

  taj: "TAJ Bank",
  tajbank: "TAJ Bank",

  opay: "OPay",
  opa: "OPay",

  kuda: "Kuda Microfinance Bank",

  moniepoint: "Moniepoint Microfinance Bank",
  teamapt: "Moniepoint Microfinance Bank",

  palmpay: "PalmPay",
  palm: "PalmPay",

  rubies: "Rubies Microfinance Bank",

  vfd: "VFD Microfinance Bank",
  vbank: "VFD Microfinance Bank",

  carbon: "Carbon",
  paylater: "Carbon",

  fairmoney: "FairMoney",
  fair: "FairMoney",

  eyowo: "Eyowo",

  sparkle: "Sparkle Bank",
};

const betterSentScore = (target: string, word: string): number => {
  const cleanTarget = target.toLowerCase().trim();
  const cleanWord = word.toLowerCase().trim();

  if (cleanTarget === cleanWord) return 100; // perfect match
  if (cleanWord.startsWith(cleanTarget)) return 90; // prefix match
  if (cleanWord.includes(cleanTarget)) return 70; // substring match

  // Character overlap score (weaker)
  let score = 0;
  for (const char of cleanTarget) {
    if (cleanWord.includes(char)) score += 1;
  }

  return score;
};

const getClosestSent = (target: string, textArray: Bank[]) => {
  const evalArray: DataPoint[] = [];
  textArray.forEach((el: Bank) => {
    evalArray.push({
      data: el,
      score: betterSentScore(replaceBankNicknames(target.trimEnd()), el.name),
    });
  });
  return evalArray.sort((x, y) => {
    return y.score - x.score;
  });
};

const saveSession = async (state: any) => {
  try {
    const data = JSON.stringify({
      ...state,
      is_verified: false,
      usd_bal: null,
    });
    const res = await axios.post(`${API_ENDPOINT}/api/cipher/`, {
      data: data,
      type: "none",
    });
    localStorage.setItem("quiverUserSession", res.data.data);
  } catch (e) {
    console.error("Failed to save Session:", e);
  }
};

const loadState = async () => {
  try {
    const serializedState = localStorage.getItem("quiverUserSession");
    const res = await axios.post(`${API_ENDPOINT}/api/cipher/`, {
      data: serializedState,
      type: "decrypt",
    });
    if (serializedState === null) return undefined;
    return JSON.parse(`${res.data.data}`);
  } catch (e) {
    console.error("Failed to load state from localStorage", e);
    return undefined;
  }
};

const hashStringSHA256 = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

const monadTestnet = defineChain({
  id: 10143, // chain ID for Monad testnet (from ChainList) :contentReference[oaicite:1]{index=1}
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://lb.drpc.org/monad-testnet/AoihSUDyHU9igiu5TQZMF0adY0_QnXoR8L-Xwg8TMB_n",
      ],
    },
    public: {
      http: [
        "https://lb.drpc.org/monad-testnet/AoihSUDyHU9igiu5TQZMF0adY0_QnXoR8L-Xwg8TMB_n",
      ],
    },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://testnet.monadexplorer.com/" },
  },
  // any extra settings if needed (e.g. contract address for deployments)
  // you might also need to add formatters or serializers, if viem requires them
});

const paymasterClient = createPaymasterClient({
  transport: http(`${import.meta.env.VITE_BUNDLER_RPC}`),
});

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(`${import.meta.env.VITE_NETWORK_RPC}`),
});

const bundlerClient = createBundlerClient({
  chain: monadTestnet,
  paymaster: paymasterClient,
  transport: http(`${import.meta.env.VITE_BUNDLER_RPC}`),
});

const chain = monadTestnet;

const sendUserOpsTransfer = async (
  walletAddr: string,
  usdcAmt: number,
  privyWallets: any
) => {
  const transferCalldata = encodeFunctionData({
    abi: [
      {
        name: "transfer",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
      },
    ],
    functionName: "transfer",
    args: [walletAddr, parseUnits(`${usdcAmt}`, 6)],
  });

  const embeddedWallet_ = await privyWallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  console.log(embeddedWallet_);
  const privyProvider = await embeddedWallet_.getEthereumProvider();
  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(privyProvider),
  });

  // get the connected account
  const [address] = await walletClient.getAddresses();

  const smartAccountSigner = await providerToSmartAccountSigner(privyProvider);

  const privyAccount = {
    ...smartAccountSigner, // ✅ this already has signMessage, signTypedData, signUserOperation
    address, // make sure address is set correctly
    type: "json-rpc", // delegation toolkit expects this
  };

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [address, [], [], []],
    deploySalt: "0x",
    signer: { account: privyAccount },
  });

  const gasPriceResponse = await bundlerClient.request({
    method: "pimlico_getUserOperationGasPrice",
    params: [],
  });

  const maxFeePerGas = BigInt(gasPriceResponse.standard.maxFeePerGas);
  const maxPriorityFeePerGas = BigInt(
    gasPriceResponse.standard.maxPriorityFeePerGas
  );

  const userOperationHash = await bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      {
        to: TA,
        data: transferCalldata,
      },
    ],
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    paymaster: paymasterClient,
  });

  console.log(userOperationHash);
  return true;
};

const initChat = async (privyWallets) => {
  const embeddedWallet_ = await privyWallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  console.log(embeddedWallet_);
  const privyProvider = await embeddedWallet_.getEthereumProvider();
  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(privyProvider),
  });

  // get the connected account
  const [address] = await walletClient.getAddresses();

  const smartAccountSigner = await providerToSmartAccountSigner(privyProvider);

  const privyAccount = {
    ...smartAccountSigner, // ✅ this already has signMessage, signTypedData, signUserOperation
    address, // make sure address is set correctly
    type: "json-rpc", // delegation toolkit expects this
  };

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [address, [], [], []],
    deploySalt: "0x",
    signer: { account: privyAccount },
  });

  const agentWallet = ethers.Wallet.createRandom(); // ephemeral; createRandom() returns { address, privateKey }
  const aiAgentAddress = agentWallet.address;
  const aiAgentPrivateKey = agentWallet.privateKey;

  // For clarity / dev only:
  console.log("AI agent created (DEV ONLY) address:", aiAgentAddress);
  // NEVER console.log(privateKey) in production
  console.log(
    "AI agent privateKey (dev only) — store securely:",
    aiAgentPrivateKey
  );

  const agentWalletInfo = privateKeyToAccount(agentWallet.privateKey);

  const agentAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid, // Hybrid smart account
    deployParams: [agentWalletInfo.address, [], [], []],
    deploySalt: "0x",
    signer: { account: agentWalletInfo },
  });

  const gasPriceResponse = await bundlerClient.request({
    method: "pimlico_getUserOperationGasPrice",
    params: [],
  });

  const maxFeePerGas = BigInt(gasPriceResponse.standard.maxFeePerGas);
  const maxPriorityFeePerGas = BigInt(
    gasPriceResponse.standard.maxPriorityFeePerGas
  );

  console.log(agentWallet);
  const agentOperationHash = await bundlerClient.sendUserOperation({
    account: agentAccount,
    calls: [
      {
        to: agentWallet.address, // the agent wallet (EOA you're "activating")
        value: 0n, // explicitly send 0 ETH
        data: "0x", // empty data for a no-op transfer
      },
    ],
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
  const delegation = createDelegation({
    to: agentAccount.address, // This example uses a delegate smart account
    from: smartAccount.address,
    environment: smartAccount.environment,
    scope: {
      type: "erc20TransferAmount",
      tokenAddress: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", //MONAD USDC
      maxAmount: 10000000n,
    },
  });

  const signature = await smartAccount.signDelegation({
    delegation,
  });

  const signedDelegation = {
    ...delegation,
    signature,
  };

  return { smartAccount, agentAccount, signedDelegation };
};

const sendTransferWithDelegation = async (
  smartAccount,
  agentWallet,
  signedDelegation,
  toAddress,
  amount,
  tokenAddress
) => {
  console.log(agentWallet);

  // 2️⃣ Encode ERC20 transfer data
  const transferData = encodeFunctionData({
    abi: [
      {
        name: "transfer",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
      },
    ],
    functionName: "transfer",
    args: [toAddress, parseUnits(`${amount}`, 6)],
  });

  const executions_ = createExecution({
    target: tokenAddress,
    value: 0n,
    data: transferData,
  });

  // 3️⃣ Encode redeemDelegations call
  const redeemDelegationCalldata = DelegationManager.encode.redeemDelegations({
    delegations: [[signedDelegation]],
    modes: [ExecutionMode.SingleDefault],
    executions: [executions_],
  });

  // 4️⃣ Get DelegationManager contract for this chain
  const env = getDeleGatorEnvironment(monadTestnet.id);

  const gasPriceResponse = await bundlerClient.request({
    method: "pimlico_getUserOperationGasPrice",
    params: [],
  });

  const maxFeePerGas = BigInt(gasPriceResponse.standard.maxFeePerGas);
  const maxPriorityFeePerGas = BigInt(
    gasPriceResponse.standard.maxPriorityFeePerGas
  );

  console.log(agentWallet);
  const agentOperationHash = await bundlerClient.sendUserOperation({
    account: agentWallet,
    calls: [
      {
        to: agentWallet.address,
        data: redeemDelegationCalldata,
      },
    ],
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });

  console.log("✅ Delegated transfer sent:", agentOperationHash);
  return true;
};

export {
  saveSession,
  loadState,
  publicClient,
  sendUserOpsTransfer,
  sendTransferWithDelegation,
  paymasterClient,
  bundlerClient,
  CA,
  hashStringSHA256,
  sendUSDC,
  chain,
  getClosestSent,
  getClosestText,
  monadTestnet,
  initChat,
  TA,
  API_ENDPOINT,
  FEE_1,
  FEE_2,
  FEE_3,
  RE_APPROVAL_WAIT_PERIOD,
};
