export function getStellarErrorMessage(error) {
    const message =
        error?.message ||
        String(error) ||
        "";

    const normalized =
        message.toLowerCase();

    // Wallet not connected
    if (
        normalized.includes(
            "wallet is not connected"
        ) ||
        normalized.includes(
            "wallet not found"
        )
    ) {
        return {
            type: "WALLET_NOT_FOUND",
            message:
                "Please connect a Stellar wallet first.",
        };
    }

    // User rejected the wallet request
    if (
        normalized.includes(
            "rejected"
        ) ||
        normalized.includes(
            "declined"
        ) ||
        normalized.includes(
            "cancelled"
        ) ||
        normalized.includes(
            "canceled"
        )
    ) {
        return {
            type: "USER_REJECTED",
            message:
                "You rejected the transaction in your wallet.",
        };
    }

    // Insufficient balance
    if (
        normalized.includes(
            "insufficient"
        ) ||
        normalized.includes(
            "underfunded"
        ) ||
        normalized.includes(
            "balance"
        )
    ) {
        return {
            type: "INSUFFICIENT_BALANCE",
            message:
                "Your wallet does not have enough XLM for this donation and transaction fees.",
        };
    }

    return {
        type: "UNKNOWN",
        message:
            message ||
            "Something went wrong while processing the transaction.",
    };
}