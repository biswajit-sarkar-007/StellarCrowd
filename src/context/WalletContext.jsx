import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";
import {
    prepareDonation,
    submitSignedTransaction,
    getTransactionStatus,
} from "../services/donation";

import {
    getStellarErrorMessage,
} from "../services/stellarErrors";

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
                    "Balance refresh failed:",
                    error
                );

                setError(
                    error?.message ||
                    "Unable to refresh balance."
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
            setTransactionHash("");
            setTransactionError("");

            try {
                // 1. Build and simulate
                const transaction =
                    await prepareDonation(
                        walletAddress,
                        amount
                    );

                // 2. Convert transaction to XDR
                const xdr =
                    transaction.toXDR();

                // 3. Ask wallet to sign
                const signed =
                    await walletService.signTransaction(
                        xdr,
                        walletAddress
                    );

                // 4. Submit signed transaction
                const submitted =
                    await submitSignedTransaction(
                        signed.signedTxXdr
                    );

                const hash =
                    submitted.hash;

                setTransactionHash(hash);

                // 5. Wait for transaction result
                let result;

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

                if (
                    result?.status ===
                    "SUCCESS"
                ) {
                    setTransactionStatus(
                        "success"
                    );

                    await refreshBalance();

                    return {
                        success: true,
                        hash,
                    };
                }

                setTransactionStatus(
                    "failed"
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
                    getStellarErrorMessage(error);

                setTransactionStatus(
                    "failed"
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