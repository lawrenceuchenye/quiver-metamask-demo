//@ts-nocheck

import React, { useState, useEffect } from "react";
import "./index.css";
import { motion as m } from "framer-motion";
import useQuiverStore from "../../store";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  API_ENDPOINT,
  bundlerClient,
  monadTestnet,
  publicClient,
} from "../utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { parseEther } from "ethers";
import { providerToSmartAccountSigner } from "permissionless";

import Loader from "../Loader";

import btnOverlayW from "../../src/assets/btnOverlayW.svg";
import btnOverlay from "../../src/assets/btnOverlay.svg";

import { createPublicClient, createWalletClient, http, custom } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";

const index: React.FC = () => {
  const [walletReadyBtnHit, setWalletReadyBtnHit] = useState(false);
  const [walletIsActive, setWalletIsActive] = useState<boolean>(true);
  const setConnectClicked = useQuiverStore((state) => state.setConnectClicked);
  const setUserData = useQuiverStore((state) => state.setUserData);
  const setSmartAccount = useQuiverStore((state) => state.setSmartAcount);

  const [embeddedWallet, setEmbeddedWallet] = useState<any | null>(null);
  const [triggered, setIsTriggered] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [connectBtnHit, setConnectBtnHit] = useState<boolean>(false);
  const [recoveringWallet, setRecoveringWallet] = useState<boolean>(false);

  const navigate = useNavigate();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const location = useLocation();
  const { wallets } = useWallets();

  const replacer = (_key: string, value: any) => {
    return typeof value === "bigint" ? value.toString() : value;
  };

  const ensureWallet = async () => {
    if (user && !user.wallet) {
      await user.createWallet();
      // 🔑 Create embedded wallet
    }
  };

  const embeddedWalletSuccess = async (embeddedWallet: any) => {
    // Get the provider for the embeded wallet, we will use in the next section
    if (!embeddedWallet) {
      setConnectClicked(true);
      return;
    }

    const privyProvider = await embeddedWallet.getEthereumProvider();
    const walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(privyProvider),
    });

    // get the connected account
    const [address] = await walletClient.getAddresses();
    const account = walletClient.account!;

    const smartAccountSigner = await providerToSmartAccountSigner(
      privyProvider
    );

    const privyAccount = {
      ...smartAccountSigner, // ✅ this already has signMessage, signTypedData, signUserOperation
      address, // make sure address is set correctly
      type: "json-rpc", // delegation toolkit expects this
    };

    setConnectBtnHit(true);

    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [address, [], [], []],
      deploySalt: "0x",
      signer: { account: privyAccount },
    });

    console.log(smartAccount);

    const gasPrice = await bundlerClient.request({
      method: "pimlico_getUserOperationGasPrice",
      params: [],
    });

    setSmartAccount(smartAccount);

    /*
    const userOperationHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: [
        {
          to: smartAccount.address, // self-call, does nothing
          value: 0n,
        },
      ],
      maxFeePerGas: gasPrice.standard.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.standard.maxPriorityFeePerGas,
      paymaster: paymasterClient,
    });*/

    const userEmail = user?.email["address"];

    setConnectClicked(false);
    if (smartAccount) {
      setUserData({
        walletAddr: smartAccount.address,
        role: "REG_USER",
        reg_date: "01/2/2025",
        is_verified: true,
        is_pin_active: false,
        is_pin_disabled: true,
        email: userEmail,
        card_color: "oklch(37.1% 0 0)",
      });
      navigate("/home");
    }

    setConnectBtnHit(true);
  };

  const connectWallet = async (role: string) => {
    setRole(role);
    const embeddedWallet_ = await wallets.find(
      (wallet) => wallet.walletClientType === "privy"
    );

    if (!embeddedWallet_) {
      try {
        await login();
        await ensureWallet();
        embeddedWalletSuccess(embeddedWallet_);
      } catch (e) {
        setRole(null);
      }

      return;
    }
    embeddedWalletSuccess(embeddedWallet_);
  };

  const connectDoubleCall = async () => {
    await connectWallet(localStorage.getItem("role"));
    if (!authenticated) {
      await new Promise((res) => {
        connectWallet(role);
      });
    }
    setConnectBtnHit(true);
  };

  useEffect(() => {
    if (localStorage.getItem("quiverUserSession")) {
      setWalletIsActive(false);
      setTimeout(() => {
        setWalletIsActive(true);
      }, 4500);
    }
  }, []);

  return (
    <div
      className="overlayContainer"
      onClick={() => location.pathname != "/home" && setConnectClicked(false)}
    >
      <m.div
        initial={{ y: "40px", opacity: 0 }}
        animate={{ y: "0px", opacity: 1 }}
        transition={{
          delay: 0.4,
          duration: 0.6,
          stiffness: 100,
          damping: 5,
          type: "spring",
        }}
        className="connectForm"
        style={{ bottom: "0px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="roleContainer">
          {!authenticated && (
            <div className="roleBtnContainer">
              <m.h1
                style={{
                  background: `url(${btnOverlayW}) no-repeat center center /
      cover,
    #000`,
                }}
                onClick={() => !connectBtnHit && connectWallet("REG_USER")}
                whileTap={{ scale: 1.2 }}
              >
                Spend Stables <i className="fa-solid fa-credit-card"></i>
              </m.h1>
            </div>
          )}

          {authenticated && (
            <div>
              <div className="roleBtnContainer">
                <div className="setDiv">
                  <h2>Wallet Ready</h2>
                  <i className="fa-solid fa-wallet" />
                </div>

                {!connectBtnHit && (
                  <m.h1
                    style={{
                      background: `url(${btnOverlay}) no-repeat center center /
      cover,
     oklch(72.3% 0.219 149.579)`,
                      opacity: !walletIsActive && "0.5",
                    }}
                    onClick={() => {
                      !connectBtnHit && walletIsActive && connectDoubleCall();
                    }}
                    whileTap={{ scale: 1.2 }}
                  >
                    Tap to Launch
                    <i style={{ scale: 1.2 }} class="fa-solid fa-rocket"></i>
                  </m.h1>
                )}

                {connectBtnHit && (
                  <m.h1
                    style={{
                      background: `url(${btnOverlay}) no-repeat center center /
      cover,
     oklch(72.3% 0.219 149.579)`,
                    }}
                    whileTap={{ scale: 1.2 }}
                  >
                    <Loader />
                  </m.h1>
                )}
              </div>
            </div>
          )}
          {!authenticated && (
            <p className="info">*Click outside the form to close.</p>
          )}
        </div>
      </m.div>
    </div>
  );
};

export default index;
