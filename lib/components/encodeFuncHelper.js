"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.handleApprove = void 0;
var viem_1 = require("viem");
var constants_1 = require("@zerodev/sdk/constants");
var sdk_1 = require("@zerodev/sdk");
var chains_1 = require("viem/chains"); // or base, polygon, etc.
var utils_1 = require("./utils");
var abi_1 = require("./contract/abi");
var store_1 = __importDefault(require("../store"));
var chain = chains_1.baseSepolia;
var ZERODEV_RPC = "https://rpc.zerodev.app/api/v3/".concat(import.meta.env.VITE_ZERO_DEV_APP_ID, "/chain/").concat(chain.id);
var entryPoint = (0, constants_1.getEntryPoint)("0.7");
var paymasterClient = (0, sdk_1.createZeroDevPaymasterClient)({
    chain: chain,
    transport: (0, viem_1.http)(ZERODEV_RPC),
});
// Define your ERC20 contract's ABI
var erc20Abi = (0, viem_1.parseAbi)([
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)", // ✅ added
]);
var handleApprove = function (amount, isPayMaster) { return __awaiter(void 0, void 0, void 0, function () {
    var kernelClient, data, userOpHash, _a, _b, _c, _d, _e, _f;
    var _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                kernelClient = store_1.default.getState().kernelClient;
                if (!!isPayMaster) return [3 /*break*/, 4];
                data = (0, viem_1.encodeFunctionData)({
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [utils_1.CA, BigInt(amount)],
                });
                _b = (_a = kernelClient).sendUserOperation;
                _g = {};
                return [4 /*yield*/, kernelClient.account.encodeCalls([
                        {
                            to: utils_1.TA, // USDC contract address
                            value: BigInt(0),
                            data: data, // encoded approve() function
                        },
                    ])];
            case 1: return [4 /*yield*/, _b.apply(_a, [(_g.callData = _j.sent(),
                        _g)])];
            case 2:
                userOpHash = _j.sent();
                return [4 /*yield*/, kernelClient.waitForUserOperationReceipt({
                        hash: userOpHash,
                        timeout: 1000 * 15,
                    })];
            case 3:
                _j.sent();
                return [2 /*return*/];
            case 4:
                _d = (_c = kernelClient).sendUserOperation;
                _h = {};
                _f = (_e = kernelClient.account).encodeCalls;
                return [4 /*yield*/, (0, sdk_1.getERC20PaymasterApproveCall)(paymasterClient, {
                        gasToken: utils_1.TA,
                        approveAmount: (0, viem_1.parseUnits)("".concat(amount), 6),
                        entryPoint: entryPoint,
                    })];
            case 5: return [4 /*yield*/, _f.apply(_e, [[
                        _j.sent()
                    ]])];
            case 6: return [4 /*yield*/, _d.apply(_c, [(_h.callData = _j.sent(),
                        _h)])];
            case 7:
                _j.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.handleApprove = handleApprove;
var createOrder = function (serviceName, approvedAmount) { return __awaiter(void 0, void 0, void 0, function () {
    var kernelClient, data, userOpHash, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                kernelClient = store_1.default.getState().kernelClient;
                data = (0, viem_1.encodeFunctionData)({
                    abi: abi_1.QuiverPayManagerABI,
                    functionName: "createOrder",
                    args: [approvedAmount, serviceName],
                });
                _b = (_a = kernelClient).sendUserOperation;
                _c = {};
                return [4 /*yield*/, kernelClient.account.encodeCalls([
                        {
                            to: utils_1.CA, // USDC contract address
                            value: BigInt(0),
                            data: data,
                        },
                    ])];
            case 1: return [4 /*yield*/, _b.apply(_a, [(_c.callData = _d.sent(),
                        _c)])];
            case 2:
                userOpHash = _d.sent();
                return [4 /*yield*/, kernelClient.waitForUserOperationReceipt({
                        hash: userOpHash,
                        timeout: 1000 * 15,
                    })];
            case 3:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createOrder = createOrder;
