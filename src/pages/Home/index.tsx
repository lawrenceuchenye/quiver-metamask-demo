//@ts-nocheck

import React from "react";
import "./index.css";
import { motion as m } from "framer-motion";
import Logos from "../../assets/logos.svg";
import Flow from "../../assets/flow.svg";
import Logo from "../../assets/Frame 68.svg";
import Arrow from "../../assets/arrow.svg";
import useQuiverStore from "../../../store";
import cardBg from "../../assets/cardBg.svg";

const Home: React.FC = () => {
  const setConnectClicked = useQuiverStore((state) => state.setConnectClicked);

  const connectUser = async () => {
    localStorage.removeItem("quiverUserSession");
    setConnectClicked(true);
  };

  return (
    <div className="parent-hmContainer">
      <div className="main-hmContainer">
        <div className="txt-container">
          <h1 className="hm-hero-txt" id="mb-txt">
            "Stables for everyday life."
          </h1>
          <p style={{ fontFamily: "Poppins" }}>
            The everyday app for the onChain user,all your daily needs settled
            instantly in one onchain app,
          </p>
          <i
            className="fa-solid fa-money-bill-transfer decor-icon"
            style={{ color: "#2ECC71" }}
          ></i>
          <i
            className="fa-solid fa-bolt decor-icon-2"
            style={{ color: "oklch(82.8% 0.189 84.429)" }}
          ></i>
          <i
            className="fa-solid fa-wifi decor-icon-3"
            style={{ color: "#00BFFF" }}
          ></i>
          <i
            className="fa-solid fa-sim-card decor-icon-4"
            style={{ color: "#FF7A00" }}
          ></i>
          <i
            className="fa-solid fa-tv decor-icon-5"
            style={{ color: "#6A0DAD" }}
          ></i>
          <br />
          <m.button
            whileTap={{ scale: 1.2 }}
            style={{ fontFamily: "Poppins" }}
            onClick={() => connectUser()}
          >
            Start spending Now <i class="fa-solid fa-bolt"></i>
          </m.button>
        </div>
      </div>

      <div className="serviceTime">
        <div className="logoDiv">
          <img src={Logos} />
        </div>
        <div className="infoDiv">
          <img src={Flow} />
          <h1>
            From Wallet To You in <br />
            <span>2 minutes</span>
          </h1>
          <p>~Quiver</p>
          <div className="servicesDiv">
            <i className="fa-solid fa-sim-card"></i>
            <i className="fa-solid fa-tv"></i>
            <i className="fa-solid fa-wifi"></i>
            <i className="fa-solid fa-bolt"></i>
            <i className="fa-solid fa-money-bill-transfer"></i>
          </div>
        </div>
        <div className="logoDiv">
          <img src={Logos} />
        </div>
      </div>
      <div className="contactDiv">
        <div
          className="ft"
          style={{
            background: `url(${cardBg}) no-repeat center center /
              cover,
             #000`,
          }}
        >
          <i className="fa-solid fa-charging-station"></i>
          <h3>All-in-one utility</h3>
          <p>
            Top up airtime,pay bills and shop,all from one app,with stablecoins.
          </p>
        </div>
        <div
          className="ft"
          style={{
            background: `url(${cardBg}) no-repeat center center /
              cover,
             #000`,
          }}
        >
          <i className="fas fa-credit-card"></i>
          <h3>Instant Payments</h3>
          <p>Send and Spend stablecoins easily.No delays,no middleman.</p>
        </div>
        <div
          className="ft"
          style={{
            background: `url(${cardBg}) no-repeat center center /
              cover,
             #000`,
          }}
        >
          <i className="fa-solid fa-globe"></i>
          <h3>Always accessible</h3>
          <p>No banks,no borders,just you and your stables anywhere.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
