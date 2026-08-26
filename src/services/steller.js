import {
    Horizon,
    Networks,
    rpc,
    Contract,
    TransactionBuilder,
    Account,
    Keypair,
    scValToNative,
} from "@stellar/stellar-sdk";

import {
    STELLAR_HORIZON_URL,
    STELLAR_RPC_URL,
    STELLAR_NETWORK_PASSPHRASE,
    STELLAR_CONTRACT_ID,
} from "../config";


const server = new Horizon.Server(
    STELLAR_HORIZON_URL
);


const rpcServer = new rpc.Server(
    STELLAR_RPC_URL
);


export const stellarService = {

    // =========================================
    // HORIZON
    // =========================================

    async getAccount(address) {

        if (!address) {
            throw new Error(
                "Wallet address is required."
            );
        }

        try {

            const account =
                await server.loadAccount(
                    address
                );

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
            await this.getAccount(
                address
            );

        const nativeBalance =
            account.balances.find(
                (balance) =>
                    balance.asset_type ===
                    "native"
            );

        if (!nativeBalance) {
            return "0";
        }

        return nativeBalance.balance;
    },


    // =========================================
    // SOROBAN CONTRACT READ
    // =========================================

    async simulateContractRead(
        method
    ) {

        if (!STELLAR_CONTRACT_ID) {
            throw new Error(
                "Stellar contract ID is not configured."
            );
        }

        try {

            const contract =
                new Contract(
                    STELLAR_CONTRACT_ID
                );


            /*
             * We need a source account only
             * for simulation.
             *
             * This account does NOT sign
             * or submit anything.
             */

            const sourceAccount =
                new Account(
                    Keypair.random().publicKey(),
                    "0"
                );


            const transaction =
                new TransactionBuilder(
                    sourceAccount,
                    {
                        fee: "100",
                        networkPassphrase:
                            STELLAR_NETWORK_PASSPHRASE,
                    }
                )
                    .addOperation(
                        contract.call(
                            method
                        )
                    )
                    .setTimeout(30)
                    .build();


            const simulated =
                await rpcServer.simulateTransaction(
                    transaction
                );


            if (
                rpc.Api.isSimulationError(
                    simulated
                )
            ) {
                throw new Error(
                    simulated.error ||
                    "Contract simulation failed."
                );
            }


            if (
                !simulated.result ||
                !simulated.result.retval
            ) {
                throw new Error(
                    "Contract returned no value."
                );
            }


            return scValToNative(
                simulated.result.retval
            );

        } catch (error) {

            console.error(
                `Contract read failed (${method}):`,
                error
            );

            throw new Error(
                `Unable to read ${method} from the Stellar contract.`
            );
        }
    },


    // =========================================
    // GET TOTAL RAISED
    // =========================================

    async getTotalRaised() {

        return this.simulateContractRead(
            "get_total_raised"
        );
    },


    // =========================================
    // GET DONOR COUNT
    // =========================================

    async getDonorCount() {

        return this.simulateContractRead(
            "get_donor_count"
        );
    },


    // =========================================
    // GET TOKEN
    // =========================================

    async getToken() {

        return this.simulateContractRead(
            "get_token"
        );
    },
};