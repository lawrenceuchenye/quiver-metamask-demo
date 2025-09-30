declare const dataPlanDB_NG: {
    "AIRTEL NG": {
        DAILY: {
            "100MB - NGN 100 - 1 DAY": number;
            "200MB - NGN 200 - 2 DAYS": number;
            "300MB - NGN 300 - 2 DAYS": number;
            "1GB - NGN 500 - 1 DAY": number;
            "1.5GB - NGN 600 - 2 DAYS": number;
            "2GB - NGN 750 - 2 DAYS": number;
            "3GB - NGN 1000 - 2 DAYS": number;
            "5GB - NGN 1,500 - 2 DAYS": number;
        };
        WEEKLY: {
            "500MB - NGN 500 - 7 DAYS": number;
            "1GB - NGN 800 - 7 DAYS": number;
            "1.5GB - NGN 1000 - 7 DAYS": number;
            "3.5GB - NGN 1,500 - 7 DAYS": number;
            "6GB - NGN 2,500 - 7 DAYS": number;
            "10GB - NGN 3,000 - 7 DAYS": number;
            "18GB - NGN 5000 - 7 DAYS": number;
        };
    };
    "MTN NG": {
        DAILY: {
            "110MB - NGN 100 - 1 DAY": number;
            "500MB - NGN 350 - 1 DAY": number;
            "1GB - NGN 500 - 1 DAY": number;
            "1.5GB - NGN 600 - 2 DAYS": number;
            "2GB - NGN 750 - 2 DAYS": number;
            "2.5GB - NGN 900 - 2 DAYS": number;
            "3.2GB - NGN 1,000 - 2 DAYS": number;
        };
        WEEKLY: {
            "500MB - NGN 500 - 7 DAYS": number;
            "1GB - NGN 800 - 7 DAYS": number;
            "1.5GB - NGN 1000 - 7 DAYS": number;
            "1.8GB - NGN 1,500 - 7 DAYS": number;
            "3.5GB - NGN 1,500 - 7 DAYS": number;
            "6GB - NGN 2,500 - 7 DAYS": number;
            "11GB - NGN 3,500 - 7 DAYS": number;
            "12.5GB - NGN 5,500 - 7 DAYS": number;
        };
    };
    "GLO NG": {
        DAILY: {
            "105MB - NGN 100 - 1 DAY": number;
            "235MB - NGN 200 - 2 DAYS": number;
            "750MB - NGN 120 - 1 DAY": number;
        };
        WEEKLY: {
            "1.5GB - NGN 500 - 7 DAYS": number;
            "500MB - NGN 250 - 14 DAYS": number;
            "1.1GB - NGN 750 - 14 DAYS": number;
            "8.5GB - NGN 2000 - 7 DAYS": number;
            "20.5GB - NGN 5,000 - 7 DAYS": number;
        };
    };
    "9MOBILE NG": {
        DAILY: {
            "83MB - NGN 100 1 DAY": number;
            "150MB - NGN 150 1 DAY": number;
            "1GB - NGN 300 1 DAY": number;
            "2GB - NGN 500 3 DAY": number;
        };
        WEEKLY: {
            "7GB - NGN 1,500 - 7 DAYS": number;
        };
    };
};
declare const NG_PREPAID_PROVIDERS: string[];
declare const knownChains: Record<number, string>;
declare const CA = "0x28A485c0c896D77F7821027EaD8b24bAe1DFBC51";
declare const TA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
declare const API_ENDPOINT = "https://twiddlemart.com";
declare const FEE = 0.37;
export { knownChains, dataPlanDB_NG, NG_PREPAID_PROVIDERS, CA, TA, API_ENDPOINT, FEE, };
