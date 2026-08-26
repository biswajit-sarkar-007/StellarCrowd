import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";

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