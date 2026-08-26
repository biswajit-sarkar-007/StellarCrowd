import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";
import {
    getStellarErrorMessage,
    prepareDonation,
    submitSignedTransaction,
    getTransactionStatus,
} from "../services/donation";

import { walletService } from "../services/wallet";
import { stellarService } from "../services/steller";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const [walletAddress, setWalletAddress] =
        useState("");

    const [walletId, setWalletId] =
        useState("");

    const [walletName, setWalletName] =
        useState("");

    const [balance, setBalance] =
        useState(null);

    const [isConnecting, setIsConnecting] =
        useState(false);

    const [isLoadingBalance, setIsLoadingBalance] =
        useState(false);

    const [error, setError] =
        useState("");
    const [transactionStatus, setTransactionStatus] =
        useState("idle");

    const [transactionHash, setTransactionHash] =
        useState("");

    const [transactionError, setTransactionError] =
        useState("");
    const [transactionStep, setTransactionStep] =
        useState("");

    // Increments every time a donation succeeds,
    // so CampaignStats can re-fetch immediately.
    const [donationCount, setDonationCount] =
        useState(0);

    const connectWallet = useCallback(async () => {
        setError("");
        setIsConnecting(true);

        try {
            await walletService.connect(
                async ({
                    address,
                    walletId,
                    walletName,
                }) => {
                    setWalletAddress(address);
                    setWalletId(walletId);
                    setWalletName(walletName);

                    setIsLoadingBalance(true);

                    try {
                        const xlmBalance =
                            await stellarService.getXlmBalance(
                                address
                            );

                        setBalance(xlmBalance);
                    } catch (balanceError) {
                        console.error(
                            "Balance fetch failed:",
                            balanceError
                        );

                        setError(
                            balanceError?.message ||
                            "Unable to fetch wallet balance."
                        );

                        setBalance(null);
                    } finally {
                        setIsLoadingBalance(false);
                    }
                }
            );
        } catch (error) {
            console.error(
                "Wallet connection failed:",
                error
            );

            setError(
                error?.message ||
                "Unable to connect wallet."
            );
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = useCallback(async () => {
        try {
            await walletService.disconnect();
        } catch (error) {
            console.error(
                "Wallet disconnect failed:",
                error
            );
        } finally {
            setWalletAddress("");
            setWalletId("");
            setWalletName("");
            setBalance(null);
            setError("");
        }
    }, []);

    const refreshBalance = useCallback(
        async () => {
            if (!walletAddress) {
                return;
            }

            setIsLoadingBalance(true);
            setError("");

            try {
                const xlmBalance =
                    await stellarService.getXlmBalance(
                        walletAddress
                    );

                setBalance(xlmBalance);
            } catch (error) {
                console.error(
                    "Refresh balance failed:",
                    error
                );

                const parsedError =
                    getStellarErrorMessage(error);

                setError(
                    parsedError.message || "Failed to refresh balance"
                );

            } finally {
                setIsLoadingBalance(false);
            }
        },
        [walletAddress]
    );

    const clearError = useCallback(() => {
        setError("");
    }, []);

    const donate = useCallback(
        async (amount) => {
            if (!walletAddress) {
                throw new Error(
                    "Please connect your wallet first."
                );
            }

            setTransactionStatus("pending");
            setTransactionStep(
                "Preparing transaction..."
            );

            setTransactionHash("");
            setTransactionError("");

            try {
                /*
                 * STEP 1
                 * Build and simulate Soroban transaction
                 */
                setTransactionStep(
                    "Preparing transaction..."
                );

                const transaction =
                    await prepareDonation(
                        walletAddress,
                        amount
                    );


                /*
                 * STEP 2
                 * Convert transaction to XDR
                 */
                setTransactionStep(
                    "Waiting for wallet approval..."
                );

                const xdr =
                    transaction.toXDR();


                /*
                 * STEP 3
                 * Ask connected wallet to sign
                 */
                const signed =
                    await walletService.signTransaction(
                        xdr,
                        walletAddress
                    );


                /*
                 * STEP 4
                 * Submit signed transaction
                 */
                setTransactionStep(
                    "Submitting transaction..."
                );

                const submitted =
                    await submitSignedTransaction(
                        signed.signedTxXdr
                    );

                const hash =
                    submitted.hash;

                setTransactionHash(hash);


                /*
                 * STEP 5
                 * Wait for Stellar confirmation
                 */
                setTransactionStep(
                    "Waiting for confirmation..."
                );

                let result = null;

                for (
                    let attempt = 0;
                    attempt < 30;
                    attempt++
                ) {
                    await new Promise(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                2000
                            )
                    );

                    result =
                        await getTransactionStatus(
                            hash
                        );

                    if (
                        result.status ===
                        "SUCCESS" ||
                        result.status ===
                        "FAILED"
                    ) {
                        break;
                    }
                }


                /*
                 * SUCCESS
                 */
                if (
                    result?.status ===
                    "SUCCESS"
                ) {
                    setTransactionStatus(
                        "success"
                    );

                    setTransactionStep(
                        "Transaction confirmed successfully."
                    );

                    await refreshBalance();

                    // Signal CampaignStats to refresh
                    setDonationCount((c) => c + 1);

                    return {
                        success: true,
                        hash,
                    };
                }


                /*
                 * FAILED / TIMEOUT
                 */
                setTransactionStatus(
                    "failed"
                );

                setTransactionStep(
                    "Transaction failed."
                );

                setTransactionError(
                    "Transaction failed or timed out."
                );

                return {
                    success: false,
                    hash,
                };

            } catch (error) {

                console.error(
                    "Donation failed:",
                    error
                );

                const parsedError =
                    getStellarErrorMessage(
                        error
                    );

                setTransactionStatus(
                    "failed"
                );

                setTransactionStep(
                    "Transaction failed."
                );

                setTransactionError(
                    parsedError.message
                );

                throw error;
            }
        },
        [
            walletAddress,
            refreshBalance,
        ]
    );
    const value = {
        walletAddress,
        walletId,
        walletName,

        balance,

        isConnected:
            Boolean(walletAddress),

        isConnecting,
        isLoadingBalance,

        error,

        connectWallet,
        disconnectWallet,
        refreshBalance,
        clearError,

        donate,

        transactionStatus,
        transactionHash,
        transactionError,
        transactionStep,

        donationCount,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context =
        useContext(WalletContext);

    if (!context) {
        throw new Error(
            "useWallet must be used inside WalletProvider."
        );
    }

    return context;
}