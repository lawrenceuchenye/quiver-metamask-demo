import { useEffect, useRef, useState } from "react";
import { motion as m } from "framer-motion";
import "./index.css";
import useQuiverStore from "../../store";
import axios from "axios";
import { API_ENDPOINT, sendUserOpsTransfer,initChat,sendTransferWithDelegation,TA } from "../utils";
import { useWallets } from "@privy-io/react-auth";

const index = () => {
  const ref = useRef(null);
  const setAgentModeActive = useQuiverStore(
    (state) => state.setAgentMondeActive
  );
  const  isAgentModeActive = useQuiverStore(
    (state) => state.isAgentModeActive
  );
  const [prompt, setPrompt] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const setChatContext = useQuiverStore((state) => state.setChatContext);
  const resetChatContext = useQuiverStore((state) => state.resetChatContext);
  const usdcBal=useQuiverStore((state)=>state.usdcBal);
  const userData=useQuiverStore((state)=>state.userData);

  const { wallets } = useWallets();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      setChatContext({ isUser: true, query: prompt });
      setPrompt("");
      setIsProcessing(true);
      const res = await axios.post(`${API_ENDPOINT}/api/parse_user_intent/`, {
        intent: `user query -${prompt} user usdc balance${usdcBal} user wallet address:${userData.walletAddr} chain:monad testnet`,
      });
      console.log(res.data.res);
      setChatContext({ isUser: false, query: res.data.res.response });
      if (res.data.res.type == "transfer") {
        if(usdcBal <   res.data.res.amount){
          setIsProcessing(false);
          return;
        }
        await sendUserOpsTransfer(
          res.data.res.to,
          res.data.res.amount,
          wallets
        );
        setChatContext({
          isUser: false,
          query: `Transfer of ${res.data.res.amount} USDC to  ${res.data.res.to} Successful`,
        });
      }
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = () => setAgentModeActive(true);
    el.addEventListener("focus", onFocus);

    resetChatContext();
    setChatContext({
      isUser: false,
      query: `You have allocated a spend limit of 50 USDC to your ai agent for this session`,
    });
    return () => {
      el.removeEventListener("focus", onFocus);
    };
  }, []);

  const getDelegationInfo=async()=>{
    if( isAgentModeActive){
      const { smartAccount,agentAccount,signedDelegation}=await initChat(wallets);
      sendTransferWithDelegation(smartAccount,agentAccount,signedDelegation,"0x48Ea1279d1A299Dc1B29d54603ca52A7eC42259f",1,TA)
      console.log(smartAccount,agentAccount,signedDelegation);
      }
  }

  useEffect(()=>{
  getDelegationInfo();
  },[isAgentModeActive])

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
          resetChatContext();
        }}
      >
        <i class="fa-solid fa-circle-xmark"></i>
      </m.div>
    </div>
  );
};

export default index;
