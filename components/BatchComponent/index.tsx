//@ts-nocheck

import React, { useEffect, useState } from "react";
import "./index.css";
import { motion as m } from "framer-motion";
import useQuiverStore from "../../store";
import { toast } from "react-toastify";
import axios from "axios";
import { API_ENDPOINT, TA, FEE_1, FEE_2, FEE_3 } from "../utils";
import { getConfig } from "../../config";
import Loader from "../Loader";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { erc20Abi, parseUnits } from "viem";
import btnOverlay from "../../src/assets/btnOverlay.svg";
import btnOverlayW from "../../src/assets/btnOverlayW.svg";

const roundToThree = (num) => {
  return Math.round(num * 1000) / 1000;
};
const index: React.FC = () => {
  const billBatch = useQuiverStore((state) => state.billBatch);
  const setIsViewBatch = useQuiverStore((state) => state.setIsViewBatch);
  const setBillBatch = useQuiverStore((state) => state.setBillBatch);
  const setBillInfo = useQuiverStore((state) => state.setBillInfo);
  const setIsViewTxDetailHistory = useQuiverStore(
    (state) => state.setIsViewTxDetailHistory
  );
  const [totalUSDC, setTotalUSDC] = useState<number>(0);
  const [totalFiat, setTotalFiat] = useState<number>(0);
  const isTxApproved = useQuiverStore((state) => state.isTxApproved);
  const setIsCheckPIN = useQuiverStore((state) => state.setIsCheckPIN);
  const setIsTxApproved = useQuiverStore((state) => state.setIsTxApproved);
  const incrementRefreshCount = useQuiverStore(
    (state) => state.incrementRefreshCount
  );
  const userData = useQuiverStore((state) => state.userData);
  const [orderStatus, setOrderStatus] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRequestTransfer, setIsRequestTransfer] = useState<boolean>(false);

  const deletBill = (indx) => {
    setBillBatch(billBatch.filter((_, i) => i !== indx));
  };

  const createOrder_ = async () => {
    if (!userData?.is_pin_disabled) {
      setIsTxApproved(false);
      setIsCheckPIN(true);
      return;
    }
    setIsProcessing(true);
  };

  const orderUtilBill = async (billInfo) => {
    setOrderStatus(null);
    setIsProcessing(true);
    console.log(billInfo);
    const balance = await readContract(getConfig(), {
      address: TA,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userData?.walletAddr],
    });

    const amountToApprove = parseUnits(
      `${
        billInfo.usdc_amount
          ? roundToThree(
              parseFloat(billInfo.usdc_amount) +
                (billInfo.usdc_amount < 0.65
                  ? FEE_1
                  : billInfo.usdc_amount > 0.65 && billInfo.usdc_amount < 9
                  ? FEE_2
                  : FEE_3)
            )
          : 0
      }`,
      6
    );

    if (balance < amountToApprove) {
      toast.error("FUND WALLET TO TRANSACT", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setIsProcessing(false);
      return;
    }

    try {
      console.log("called");
      const res = await axios.post(`${API_ENDPOINT}/api/create_tx/`, {
        ...billInfo,
        usdc_amount: roundToThree(parseFloat(billInfo.usdc_amount)),
        fiat_amount: parseFloat(billInfo.fiat_amount),
        type: billInfo.type,
        code: billInfo.code,
      });
      setOrderStatus(res.data);
      if (res.data.success) {
        incrementRefreshCount();
        if (billInfo.type == "Airtime") {
          toast.success(`AIRTIME RECHARGE FOR SUCCESSFUL`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }

        if (billInfo.type == "Data") {
          toast.success(`DATA RECHARGE FOR SUCCESSFUL`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }

        setIsProcessing(false);
      }
      setIsTxApproved(false);
    } catch (e) {
      console.log(e);
    }
  };

  const payBills = async () => {
    await billBatch.map((bill) => {
      setTimeout(orderUtilBill(bill), 8000);
    });
  };

  useEffect(() => {
    if (isTxApproved) {
      setIsProcessing(true);
    }

    if (isTxApproved && isProcessing) {
      console.log(isTxApproved);
      billBatch.map((bill) => {
        orderUtilBill(bill);
      });
      setIsTxApproved(false);
    }

    if (userData?.is_pin_disabled && isProcessing) {
      payBills();
      setIsTxApproved(false);
    }
  }, [isTxApproved, isProcessing]);

  useEffect(() => {
    let totalUSDC = 0;
    let totalFiat = 0;

    billBatch?.map((bill) => {
      totalUSDC += parseFloat(bill?.usdc_amount);
      totalFiat += parseFloat(bill?.fiat_amount);
    });
    setTotalUSDC(totalUSDC);
    setTotalFiat(totalFiat);
  }, [billBatch]);

  return (
    <div className="billsOverlay" onClick={() => setIsViewBatch(false)}>
      <m.div
        onClick={(e: any) => e.stopPropagation()}
        className="billsContainer"
        initial={{ y: "40px", opacity: 0 }}
        animate={{ y: "0px", opacity: 1 }}
        transition={{
          delay: 0.4,
          duration: 0.6,
          stiffness: 100,
          damping: 5,
          type: "spring",
        }}
      >
        <div className="billsHeader">
          <h1>
            BILLS
            <i className="fa-solid fa-charging-station"></i>
          </h1>
        </div>
        <div>
          <div className="line"></div>
          <p style={{ fontFamily: "Poppins" }}>Description</p>
          <div className="line"></div>
          {billBatch && billBatch[0] ? (
            billBatch?.map((bill, indx) => {
              return (
                <div key={indx}>
                  <div className="bill-summary">
                    {bill?.type == "Airtime" && (
                      <p style={{ fontFamily: "Poppins" }}>
                        <i
                          style={{ marginRight: "10px" }}
                          className="fa-solid fa-sim-card"
                        ></i>
                        Airtime{" "}
                      </p>
                    )}
                    {bill?.type == "Data" && (
                      <p style={{ fontFamily: "Poppins" }}>
                        <i
                          style={{ marginRight: "10px" }}
                          className="fa-solid fa-wifi"
                        ></i>
                        Data{" "}
                      </p>
                    )}
                    {bill?.type == "Electricity" && (
                      <p style={{ fontFamily: "Poppins" }}>
                        <i
                          className="fa-solid fa-bolt"
                          style={{ marginRight: "10px" }}
                        ></i>
                        Electricity{" "}
                      </p>
                    )}
                    {bill?.type == "Tv" && (
                      <p style={{ fontFamily: "Poppins" }}>
                        <i
                          className="fa-solid fa-tv"
                          style={{ marginRight: "10px" }}
                        ></i>
                        TV{" "}
                      </p>
                    )}

                    <p>
                      {bill?.usdc_amount} USDC ~ {bill?.fiat_amount} NGN{" "}
                      <m.i
                        className="fa-solid fa-eye"
                        whileTap={{ scale: 0.8 }}
                        style={{ margin: "0 5px", marginLeft: "10px" }}
                        onClick={() => {
                          setBillInfo(bill);
                          setIsViewTxDetailHistory(true);
                        }}
                      ></m.i>
                      <m.i
                        className="fa-solid fa-trash"
                        whileTap={{ scale: 0.8 }}
                        style={{
                          marginLeft: "8px",
                          color: "oklch(64.5% 0.246 16.439)",
                        }}
                        onClick={() => deletBill(indx)}
                      ></m.i>
                    </p>
                  </div>
                  <div className="line"></div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                fontFamily: "Poppins",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <p>One tap your bills in one go.</p>
              <div className="line"></div>
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: "Poppins",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p>Total</p>
          <p>
            {totalUSDC} USDC ~ {totalFiat} NGN
          </p>
        </div>
        <div className="line"></div>
        <div className="btn-utils">
          <button
            className="pay-btn"
            style={{
              background: `url(${btnOverlayW}) no-repeat center center /
                          cover,
                        #000`,
            }}
            onClick={() => createOrder_()}
          >
            {isProcessing ? (
              <Loader />
            ) : (
              <>
                <p>
                  {billBatch
                    ? `Pay ${billBatch?.length} 
                  ${billBatch?.length < 2 ? "Bill" : "Bills"}`
                    : `Pay 
                  ${billBatch?.length < 2 ? "Bill" : "Bills"}`}
                </p>
              </>
            )}
          </button>
          <button
            onClick={() => setBillBatch(null)}
            style={{
              marginLeft: "8px",
              width: "35%",
              background: `url(${btnOverlay}) no-repeat center center /
                            cover,
                          oklch(57.7% 0.245 27.325)`,
            }}
          >
            Clear
          </button>
        </div>
        <p
          style={{
            color: "oklch(70.4% 0.04 256.788)",
            textTransform: "lowercase",
            fontFamily: "Poppins",
          }}
        >
          *Click outside the form to exit
        </p>
      </m.div>
    </div>
  );
};

export default index;
