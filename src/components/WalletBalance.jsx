import { useWallet } from "../context/WalletContext";

function WalletBalance() {
    const {
        balance,
        isConnected,
        isLoadingBalance,
        refreshBalance,
    } = useWallet();

    if (!isConnected) {
        return null;
    }

    return (
        <section className="balance-card">
            <div className="balance-header">
                <div>
                    <p className="balance-label">
                        YOUR TESTNET BALANCE
                    </p>

                    <h2 className="balance-value">
                        {isLoadingBalance
                            ? "Loading..."
                            : `${balance ?? "0"} XLM`}
                    </h2>
                </div>

                <button
                    className="refresh-button"
                    onClick={refreshBalance}
                    disabled={isLoadingBalance}
                >
                    {isLoadingBalance
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </div>
        </section>
    );
}

export default WalletBalance;