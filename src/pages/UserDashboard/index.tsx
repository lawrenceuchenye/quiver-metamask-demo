//@ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import "./index.css";

import { API_ENDPOINT } from "../../../components/utils";
import UserOverview from "../../../components/UserOverview";
import UserFinanceInfo from "../../../components/UserFinanceInfo";

import { JsonRpcProvider, Contract, formatUnits } from "ethers";
import { TA } from "../../../components/utils";
import { erc20Abi } from "viem";
import { toast } from "react-toastify";
import useQuiverStore from "../../../store";
import axios from "axios";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { set } from "date-fns";

const Dashboard: React.FC = () => {
  const userData = useQuiverStore((state) => state.userData);
  const setUserData = useQuiverStore((state) => state.setUserData);
  const incrementRefreshCount = useQuiverStore(
    (state) => state.incrementRefreshCount
  );
  const setIsPending = useQuiverStore((state) => state.setIsPending);
  const setIsViewKYCForm = useQuiverStore((state) => state.setIsViewKYCForm);
  const { user } = usePrivy();
  const setConnectClicked = useQuiverStore((state) => state.setConnectClicked);
  const navigate = useNavigate();
  const lastProcessedBlockRefID = useRef<number>(0);
  const booted = useRef<number>(0);

  // USDC Transfer event signature

  const roundToTwo = (num) => {
    return Math.round(num * 100) / 100;
  };

  const GRAPHQL_URL = "http://localhost:8080/v1/graphql";

  const fetchLatestTransfer = async (targetAddress: string) => {
    try {
      const query = `
  query {
    MonadUSDC_Transfer(
      where: { _or: [
        { from: { _eq: "${targetAddress}" } },
        { to: { _eq: "${targetAddress}" } }
      ] },
      order_by: { block_number: desc },
      limit: 1
    ) {
      id
      from
      to
      value
      block_number
      timestamp
    }
  }
`;

      const res = await axios.post(GRAPHQL_URL, { query });
      const transfer = res.data.data?.MonadUSDC_Transfer?.[0];

      if (transfer) {
        if (booted.current == 0) {
          lastProcessedBlockRefID.current = transfer.block_number;
          booted.current = 1;
          return;
        }

        const lastBlock = lastProcessedBlockRefID.current;
        if (lastBlock === transfer.block_number) return;
        lastProcessedBlockRefID.current = transfer.block_number;

        if (transfer.from == targetAddress) {
          incrementRefreshCount();
          toast.error(`-${transfer.value / 1000000} USDC DEBITTED`, {
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

        if (transfer.to == targetAddress) {
          incrementRefreshCount();
          toast.success(`+${transfer.value / 1000000} USDC DEPOSITED`, {
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
      } else {
        console.log("No transfer found.");
      }
    } catch (err) {
      console.error("Error fetching latest transfer:", err.message);
    }
  };

  const isVerified = async () => {
    const res = await axios.post(`${API_ENDPOINT}/api/is_verified/`, {
      email: userData.email,
    });

    if (res.data.success) {
      setUserData({ ...userData, is_verified: true });
      setIsViewKYCForm(false);
    } else {
      setUserData({ ...userData, is_verified: false });
      setIsViewKYCForm(true);
    }
  };

  useEffect(() => {
    const intervalIDi = setInterval(() => {
      fetchLatestTransfer(userData?.walletAddr ? userData?.walletAddr : "0x");
    }, 3000);

    isVerified();
    return () => {
      clearInterval(intervalIDi);
    };
  }, []);

  useEffect(() => {
    if (!userData) {
      setConnectClicked(true);
      navigate("");
    }
    if (!userData?.is_verified) {
      setIsViewKYCForm(true);
    }
  }, []);

  return (
    <div className="userDashboard">
      <UserOverview />
      <UserFinanceInfo />
    </div>
  );
};

export default Dashboard;
