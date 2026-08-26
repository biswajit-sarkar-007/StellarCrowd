import {
    STELLAR_NETWORK_PASSPHRASE,
    STELLAR_SOROBAN_RPC_URL,
} from "../config/stellar";

export const contractService = {
    rpcUrl: STELLAR_SOROBAN_RPC_URL,

    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,

    async getGoal() {
        throw new Error(
            "Contract getGoal() has not been implemented yet."
        );
    },

    async getTotalRaised() {
        throw new Error(
            "Contract getTotalRaised() has not been implemented yet."
        );
    },

    async getDonorCount() {
        throw new Error(
            "Contract getDonorCount() has not been implemented yet."
        );
    },

    async donate() {
        throw new Error(
            "Contract donate() has not been implemented yet."
        );
    },
};