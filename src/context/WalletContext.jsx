import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";

import { walletService } from "../services/wallet";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const [walletAddress, setWalletAddress] = useState("");
    const [walletId, setWalletId] = useState("");
    const [walletName, setWalletName] = useState("");

    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");

    const connectWallet = useCallback(async () => {
        setError("");
        setIsConnecting(true);

        try {
            await walletService.connect(
                ({ address, walletId, walletName }) => {
                    setWalletAddress(address);
                    setWalletId(walletId);
                    setWalletName(walletName);
                }
            );
        } catch (error) {
            console.error(error);

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
            console.error(error);
        } finally {
            setWalletAddress("");
            setWalletId("");
            setWalletName("");
            setError("");
        }
    }, []);

    const clearError = useCallback(() => {
        setError("");
    }, []);

    const value = {
        walletAddress,
        walletId,
        walletName,

        isConnected: Boolean(walletAddress),

        isConnecting,

        error,

        connectWallet,
        disconnectWallet,
        clearError,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);

    if (!context) {
        throw new Error(
            "useWallet must be used inside WalletProvider."
        );
    }

    return context;
}