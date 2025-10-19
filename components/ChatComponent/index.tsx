//@ts-nocheck
import { useEffect, useRef, useState } from "react";
import { motion as m } from "framer-motion";
import "./index.css";
import useQuiverStore from "../../store";
import axios from "axios";
import {
  API_ENDPOINT,
  sendUserOpsTransfer,
  sendTransferWithDelegation,
  TA,
  CA,
  FEE_1,
  FEE_2,
  FEE_3,
} from "../utils";
import { useWallets } from "@privy-io/react-auth";

const roundToThree = (num) => {
  return Math.round(num * 1000) / 1000;
};

const index = () => {
  const ref = useRef(null);
  const setAgentModeActive = useQuiverStore(
    (state) => state.setAgentMondeActive
  );
  const isAgentModeActive = useQuiverStore((state) => state.isAgentModeActive);
  const [prompt, setPrompt] = useState<string>("");
  const [contextUpdated, setContextUpdated] = useState<boolean>(false);
  const [pricingData, setPricingData] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const setChatContext = useQuiverStore((state) => state.setChatContext);
  const resetChatContext = useQuiverStore((state) => state.resetChatContext);
  const usdcBal = useQuiverStore((state) => state.usdcBal);
  const userData = useQuiverStore((state) => state.userData);
  const tokenTransferContext = useQuiverStore(
    (state) => state.tokenTransferContext
  );

  const getPrice = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NGN_USDC_RATE_ENDPOINT}`
      );
      setPricingData(res.data.data);
    } catch (e) {}
  };

  const { wallets } = useWallets();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      setChatContext({ isUser: true, query: prompt });
      setPrompt("");
      setIsProcessing(true);
      const res = await axios.post(`${API_ENDPOINT}/api/parse_user_intent/`, {
        intent: `exchangeRate:${pricingData} ${prompt}`,
        usdcBal: usdcBal,
        userWallet: userData.walletAddr,
        to: tokenTransferContext ? tokenTransferContext.to : "",
        from: tokenTransferContext ? tokenTransferContext.from : "",
        amount: tokenTransferContext ? tokenTransferContext.amount : "",
      });
      console.log(res.data.res);

      setChatContext({ isUser: false, query: res.data.res.response });
      if (res.data.res.type == "transfer" || res.data.res.type == "approval") {
        if (usdcBal < res.data.res.amount) {
          setIsProcessing(false);
          return;
        }
        await sendUserOpsTransfer(
          res.data.res.to,
          res.data.res.amount,
          wallets
        );
      }

      if (res.data.res.type == "airtime") {
        if (usdcBal < res.data.res.amount) {
          setIsProcessing(false);
          return;
        }
        await sendUserOpsTransfer(CA, res.data.res.amount, wallets);

        console.log(res);

        const res2 = await axios.post(`${API_ENDPOINT}/api/create_tx_monad/`, {
          network: res.data.res.network,
          userWallet: userData?.walletAddr,
          issuer_address: userData?.walletAddr,

          type: "Airtime",
          usdc_amount: roundToThree(
            parseFloat(res.data.res.amount) +
              (res.data.res.amount < 0.65
                ? FEE_1
                : res.data.res.amount > 0.65 && res.data.res.amount < 9
                ? FEE_2
                : FEE_3)
          ),
          amount: parseFloat(res.data.res.fiatamount),
          fiat_amount: parseFloat(res.data.res.fiatamount),
          code: "",
          phone_number: res.data.res.receiver,
        });
        setChatContext({ isUser: false, query: "Airtime purchase successful" });
      }

      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = () => {
      setAgentModeActive(true);
    };
    el.addEventListener("focus", onFocus);
    getPrice();
    resetChatContext();
    return () => {
      el.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div className="chatHolder">
      <textarea
        placeholder="Try agent mode"
        value={prompt}
        ref={ref}
        onChange={(e) => {
          setPrompt(e.target.value);
          console.log(prompt);
        }}
        onKeyDown={handleKeyDown}
      ></textarea>
      <m.div
        className="btn"
        whileTap={{ scale: 1.2 }}
        onClick={async () => {
          setChatContext({ isUser: true, query: prompt });
          setPrompt("");
          setIsProcessing(true);

          const res = await axios.post(
            `${API_ENDPOINT}/api/parse_user_intent/`,
            {
              intent: prompt,
              usdcBal: usdcBal,
              userWallet: userData.walletAddr,
            }
          );
          console.log(res);
          setIsProcessing(false);
        }}
      >
        {isProcessing ? (
          <i className="fa-solid fa-square"></i>
        ) : (
          <i className="fa-solid fa-arrow-up"></i>
        )}
      </m.div>
      <m.div
        className="btn"
        whileTap={{ scale: 1.2 }}
        style={{ background: "oklch(64.5% 0.246 16.439)", marginLeft: "7px" }}
        onClick={() => {
          setAgentModeActive(false);
          setIsProcessing(false);
          setContextUpdated(false);
          resetChatContext();
        }}
      >
        <i class="fa-solid fa-circle-xmark"></i>
      </m.div>
    </div>
  );
};

export default index;
