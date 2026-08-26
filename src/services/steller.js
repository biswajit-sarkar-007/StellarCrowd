import {
    Horizon,
    Networks,
} from "@stellar/stellar-sdk";

import {
    STELLAR_HORIZON_URL,
} from "../config/stellar";

const server = new Horizon.Server(
    STELLAR_HORIZON_URL
);

export const stellarService = {
    async getAccount(address) {
        if (!address) {
            throw new Error(
                "Wallet address is required."
            );
        }

        try {
            const account =
                await server.loadAccount(address);

            return account;
        } catch (error) {
            console.error(
                "Failed to load Stellar account:",
                error
            );

            if (
                error?.response?.status === 404
            ) {
                throw new Error(
                    "This Stellar account does not exist on Testnet. Fund it first."
                );
            }

            throw new Error(
                "Unable to fetch Stellar account."
            );
        }
    },

    async getXlmBalance(address) {
        const account =
            await this.getAccount(address);

        const nativeBalance =
            account.balances.find(
                (balance) =>
                    balance.asset_type === "native"
            );

        if (!nativeBalance) {
            return "0";
        }

        return nativeBalance.balance;
    },
};