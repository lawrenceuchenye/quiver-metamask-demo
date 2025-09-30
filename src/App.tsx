import { useEffect, useState } from "react";
import { Navbar, MobileNav } from "../components/Navbar";
import ConnectOverlay from "../components/ConnectOverlay";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import UserDashboard from "./pages/UserDashboard";

import { Send, Summary } from "../components/TransactionsOverlay";

import "./App.css";
import useQuiverStore from "../store";
import FootBar from "../components/FootBar";
import { OffRamp, OffRampSummary } from "../components/RampOverlays";
import Settings from "../components/Settings";
import TransactionHistory from "../components/TransactionHistory";
import TransactionDetail from "../components/TransactionDetail";
import KYCOverlay from "../components/KYCOverlay";
import CardColors from "../components/CardColors";
import BatchComponent from "../components/BatchComponent";

import { SetUpPIN, ConfirmPIN, CheckPIN } from "../components/PINOverlay";

function App() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const userData = useQuiverStore((state) => state.userData);
  const connectClicked = useQuiverStore((state) => state.connectClicked);
  const isPay = useQuiverStore((state) => state.isPay);
  const billType = useQuiverStore((state) => state.billType);
  const billInfo = useQuiverStore((state) => state.billInfo);
  const isTransfer = useQuiverStore((state) => state.isTransfer);
  const offRampData = useQuiverStore((state) => state.offRampData);
  const isSettings = useQuiverStore((state) => state.isSettings);
  const isViewTxHistory = useQuiverStore((state) => state.isViewTxHistory);
  const isViewKYCForm = useQuiverStore((state) => state.isViewKYCForm);
  const isViewTxDetailHistory = useQuiverStore(
    (state) => state.isViewTxDetailHistory
  );
  const isCheckPIN = useQuiverStore((state) => state.isCheckPIN);
  const isTxApproved = useQuiverStore((state) => state.isTxApproved);
  const isDisablingPIN = useQuiverStore((state) => state.isDisablingPIN);
  const isChangeCardColor = useQuiverStore((state) => state.isChangeCardColor);
  const isViewBatch = useQuiverStore((state) => state.isViewBatch);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1200 ? true : false);
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ overflowX: "hidden" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<UserDashboard />} />
        </Routes>
      </div>
      {(isPay || billInfo) && !isViewTxDetailHistory && userData && (
        <Send type={billType} />
      )}
      {billInfo && isPay && userData && (
        <Summary billInfo={billInfo} serviceName={billType} />
      )}

      {isViewTxDetailHistory && (
        <TransactionDetail billInfo={billInfo} serviceName={billType} />
      )}
      {isMobile && <MobileNav />}
      {connectClicked && <ConnectOverlay />}
      {isTransfer && <OffRamp />}
      {((offRampData && isCheckPIN) || offRampData) && <OffRampSummary />}
      {isSettings && <Settings />}
      {isViewTxHistory && <TransactionHistory />}
      {isViewKYCForm && userData && <KYCOverlay />}
      {userData?.email && !userData.is_pin_active && <SetUpPIN />}
      {userData?.pinHash && !userData.is_pin_active && <ConfirmPIN />}
      {isCheckPIN && billInfo && isPay && <CheckPIN />}
      {isCheckPIN && offRampData && <CheckPIN />}
      {isCheckPIN && !isTxApproved && <CheckPIN />}
      {isDisablingPIN && !isTxApproved && <CheckPIN />}
      {isChangeCardColor && <CardColors />}
      {isViewBatch && <BatchComponent />}
      <FootBar />
    </>
  );
}

export default App;
