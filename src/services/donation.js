import {
    Contract,
    TransactionBuilder,
    BASE_FEE,
    Address,
    nativeToScVal,
} from "@stellar/stellar-sdk";

import {
    Server,
    Api,
    assembleTransaction,
} from "@stellar/stellar-sdk/rpc";

import { STELLAR_CONFIG } from "../config";

const server = new Server(
    STELLAR_CONFIG.rpcUrl
);

const contract = new Contract(
    STELLAR_CONFIG.contractId
);

function convertXlmToStroops(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(
            "Donation amount must be greater than zero."
        );
    }

    return BigInt(
        Math.round(value * 10_000_000)
    );
}

export async function prepareDonation(
    walletAddress,
    amount
) {
    if (!walletAddress) {
        throw new Error(
            "Wallet is not connected."
        );
    }

    const amountInStroops =
        convertXlmToStroops(amount);

    const account =
        await server.getAccount(
            walletAddress
        );

    const donor =
        Address.fromString(
            walletAddress
        );

    const operation =
        contract.call(
            "donate",

            nativeToScVal(
                donor,
                {
                    type: "address",
                }
            ),

            nativeToScVal(
                amountInStroops,
                {
                    type: "i128",
                }
            )
        );

    const transaction =
        new TransactionBuilder(
            account,
            {
                fee: BASE_FEE,
                networkPassphrase:
                    STELLAR_CONFIG.networkPassphrase,
            }
        )
            .addOperation(operation)
            .setTimeout(180)
            .build();

    console.log(
        "Simulating donation transaction..."
    );

    const simulated =
        await server.simulateTransaction(
            transaction
        );

    if (
        Api.isSimulationError(
            simulated
        )
    ) {
        throw new Error(
            simulated.error ||
            "Transaction simulation failed."
        );
    }

    console.log(
        "Simulation successful."
    );

    const prepared =
        assembleTransaction(
            transaction,
            simulated
        ).build();

    return prepared;
}

export async function submitSignedTransaction(
    signedXdr
) {
    console.log(
        "Submitting signed transaction..."
    );

    const transaction =
        TransactionBuilder.fromXDR(
            signedXdr,
            STELLAR_CONFIG.networkPassphrase
        );

    const result =
        await server.sendTransaction(
            transaction
        );

    console.log(
        "Submission result:",
        result
    );

    if (result.status === "ERROR") {
        throw new Error(
            result.errorResultXdr ||
            "Transaction submission failed."
        );
    }

    return result;
}

export async function getTransactionStatus(
    hash
) {
    return server.getTransaction(hash);
}