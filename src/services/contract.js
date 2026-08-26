import {
    Contract,
    TransactionBuilder,
    BASE_FEE,
} from "@stellar/stellar-sdk";

import {
    Server,
    Api,
} from "@stellar/stellar-sdk/rpc";

import { STELLAR_CONFIG } from "../config";

const server = new Server(
    STELLAR_CONFIG.rpcUrl
);

const contract = new Contract(
    STELLAR_CONFIG.contractId
);

async function buildSimulation(
    walletAddress,
    method
) {
    const account =
        await server.getAccount(walletAddress);

    const transaction =
        new TransactionBuilder(
            account,
            {
                fee: BASE_FEE,
                networkPassphrase:
                    STELLAR_CONFIG.networkPassphrase,
            }
        )
            .addOperation(
                contract.call(method)
            )
            .setTimeout(30)
            .build();

    return server.simulateTransaction(
        transaction
    );
}

export async function getTotalRaised(
    walletAddress
) {
    const result =
        await buildSimulation(
            walletAddress,
            "get_total_raised"
        );

    if (result.error) {
        throw new Error(result.error);
    }

    return result.result?.retval;
}

export async function getDonorCount(
    walletAddress
) {
    const result =
        await buildSimulation(
            walletAddress,
            "get_donor_count"
        );

    if (result.error) {
        throw new Error(result.error);
    }

    return result.result?.retval;
}