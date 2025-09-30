declare const handleApprove: (amount: number, isPayMaster: boolean) => Promise<void>;
declare const createOrder: (serviceName: string, approvedAmount: number) => Promise<void>;
export { handleApprove, createOrder };
