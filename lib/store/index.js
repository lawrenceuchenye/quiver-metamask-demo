"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zustand_1 = require("zustand");
var useQuiverStore = (0, zustand_1.create)(function (set) { return ({
    userData: null,
    connectClicked: false,
    billType: null,
    isPay: false,
    billInfo: null,
    isStake: false,
    isStaked: false,
    reFreshCount: 0,
    kernelClient: null,
    incrementRefreshCount: function () {
        set(function (state) { return ({ reFreshCount: state.reFreshCount + 1 }); });
    },
    setKernelClient: function (kernelCl) {
        set(function () { return ({ kernelClient: kernelCl }); });
    },
    setIsStake: function (isStake) {
        set(function () { return ({ isStake: isStake }); });
    },
    setIsStaked: function (isStaked) {
        set(function () { return ({ isStaked: isStaked }); });
    },
    setConnectClicked: function (clickState) {
        set(function () { return ({ connectClicked: clickState }); });
    },
    setUserData: function (data) {
        set(function () { return ({ userData: data }); });
    },
    setIsPay: function (isPay, billType) {
        set(function () { return ({ isPay: isPay, billType: billType, billInfo: null }); });
    },
    setBillInfo: function (bill) {
        set(function () { return ({ billInfo: bill }); });
    },
}); });
exports.default = useQuiverStore;
