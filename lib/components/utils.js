"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEE = exports.API_ENDPOINT = exports.TA = exports.CA = exports.NG_PREPAID_PROVIDERS = exports.dataPlanDB_NG = exports.knownChains = void 0;
var dataPlanDB_NG = {
    "AIRTEL NG": {
        DAILY: {
            "100MB - NGN 100 - 1 DAY": 100,
            "200MB - NGN 200 - 2 DAYS": 200,
            "300MB - NGN 300 - 2 DAYS": 300,
            "1GB - NGN 500 - 1 DAY": 500,
            "1.5GB - NGN 600 - 2 DAYS": 600,
            "2GB - NGN 750 - 2 DAYS": 750,
            "3GB - NGN 1000 - 2 DAYS": 1000,
            "5GB - NGN 1,500 - 2 DAYS": 1500,
        },
        WEEKLY: {
            "500MB - NGN 500 - 7 DAYS": 500,
            "1GB - NGN 800 - 7 DAYS": 800,
            "1.5GB - NGN 1000 - 7 DAYS": 1000,
            "3.5GB - NGN 1,500 - 7 DAYS": 1500,
            "6GB - NGN 2,500 - 7 DAYS": 2500,
            "10GB - NGN 3,000 - 7 DAYS": 3000,
            "18GB - NGN 5000 - 7 DAYS": 5000,
        },
    },
    "MTN NG": {
        DAILY: {
            "110MB - NGN 100 - 1 DAY": 100,
            "500MB - NGN 350 - 1 DAY": 350,
            "1GB - NGN 500 - 1 DAY": 500,
            "1.5GB - NGN 600 - 2 DAYS": 600,
            "2GB - NGN 750 - 2 DAYS": 750,
            "2.5GB - NGN 900 - 2 DAYS": 900,
            "3.2GB - NGN 1,000 - 2 DAYS": 1000,
        },
        WEEKLY: {
            "500MB - NGN 500 - 7 DAYS": 500,
            "1GB - NGN 800 - 7 DAYS": 800,
            "1.5GB - NGN 1000 - 7 DAYS": 1000,
            "1.8GB - NGN 1,500 - 7 DAYS": 1500,
            "3.5GB - NGN 1,500 - 7 DAYS": 1500,
            "6GB - NGN 2,500 - 7 DAYS": 2500,
            "11GB - NGN 3,500 - 7 DAYS": 3500,
            "12.5GB - NGN 5,500 - 7 DAYS": 5500,
        },
    },
    "GLO NG": {
        DAILY: {
            "105MB - NGN 100 - 1 DAY": 100,
            "235MB - NGN 200 - 2 DAYS": 200,
            "750MB - NGN 120 - 1 DAY": 120,
        },
        WEEKLY: {
            "1.5GB - NGN 500 - 7 DAYS": 500,
            "500MB - NGN 250 - 14 DAYS": 250,
            "1.1GB - NGN 750 - 14 DAYS": 750,
            "8.5GB - NGN 2000 - 7 DAYS": 2000,
            "20.5GB - NGN 5,000 - 7 DAYS": 5000,
        },
    },
    "9MOBILE NG": {
        DAILY: {
            "83MB - NGN 100 1 DAY": 100,
            "150MB - NGN 150 1 DAY": 150,
            "1GB - NGN 300 1 DAY": 300,
            "2GB - NGN 500 3 DAY": 500,
        },
        WEEKLY: {
            "7GB - NGN 1,500 - 7 DAYS": 1500,
        },
    },
};
exports.dataPlanDB_NG = dataPlanDB_NG;
var NG_PREPAID_PROVIDERS = [
    "IBADAN ELECTRICITY",
    "JOS ELECTRICITY",
    "IKEJA ELECTRICITY",
    "PORT HARCOURT ELECTRICITY",
    "KADUNA ELECTRICITY",
    "ABUJA ELECTRICITY",
    "EKO ELECTRICITY",
    "ENUGU ELECTRICITY",
    "KANO ELECTRICITY",
    "BENIN ELECTRICITY",
    "YOLA ELECTRICITY",
    "ABA ELECTRICITY",
];
exports.NG_PREPAID_PROVIDERS = NG_PREPAID_PROVIDERS;
var knownChains = {
    // ✅ Mainnets
    1: "Ethereum Mainnet",
    137: "Polygon",
    10: "Optimism",
    42161: "Arbitrum One",
    8453: "Base",
    56: "BNB Smart Chain",
    250: "Fantom",
    100: "Gnosis",
    43114: "Avalanche C-Chain",
    42220: "Celo",
    // 🧪 Testnets
    84532: "Base Sepolia",
    5: "Goerli Testnet",
    11155111: "Sepolia Testnet",
    80001: "Mumbai Testnet",
    420: "Optimism Goerli",
    421613: "Arbitrum Goerli",
    84531: "Base Goerli",
    97: "BNB Testnet",
    43113: "Avalanche Fuji Testnet",
    44787: "Celo Alfajores Testnet",
};
exports.knownChains = knownChains;
var CA = "0x28A485c0c896D77F7821027EaD8b24bAe1DFBC51"; //"0x1d8b0d97900319aE0778cE45D67eA45cDaBF602B";
exports.CA = CA;
var TA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; //'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
exports.TA = TA;
var API_ENDPOINT = "https://twiddlemart.com";
exports.API_ENDPOINT = API_ENDPOINT;
var FEE = 0.37;
exports.FEE = FEE;
