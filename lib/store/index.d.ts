interface UserData {
    walletAddr: string;
    role: string;
    reg_date: string;
}
interface Airtime {
    network: string | null;
    amount: number | null;
    phone_number: string | null;
    usdc_amount: string | null;
    fiat_amount: number | null;
    issuer_address: string | undefined;
    orderId: number;
}
interface Data {
    network: string | null;
    phone_number: string | null;
    plan: string | null;
    amount: number | null;
    usdc_amount: string | null;
    fiat_amount: number | null;
    issuer_address: string | undefined;
    orderId: number;
    data_plan: null | string;
}
interface Electricity {
    provider: string | null;
    meter_number: string | null;
    meter_owner: string | null;
    amount: number | null;
    usdc_amount: string | null;
    fiat_amount: number;
    issuer_address: string | undefined;
    orderId: number;
}
interface QuiverState {
    userData: UserData | null;
    connectClicked: boolean;
    isPay: boolean;
    billType: string | null;
    billInfo: null | Airtime | Data | Electricity;
    isStake: boolean;
    isStaked: boolean;
    reFreshCount: number;
    kernelClient: any | null | number;
    incrementRefreshCount: () => void;
    setConnectClicked: (clickState: boolean) => void;
    setUserData: (data: null | UserData) => void;
    setIsPay: (isPay: boolean, billType: string) => void;
    setBillInfo: (bill: null | Airtime | Data | Electricity) => void;
    setIsStake: (isStake: boolean) => void;
    setIsStaked: (isStaked: boolean) => void;
    setKernelClient: (kernelCl: any) => void;
}
declare const useQuiverStore: import("zustand").UseBoundStore<import("zustand").StoreApi<QuiverState>>;
export default useQuiverStore;
