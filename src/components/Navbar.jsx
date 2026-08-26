import { useWallet } from "../context/WalletContext";

function shortenAddress(address) {
    if (!address) {
        return "";
    }

    return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

function Navbar() {
    const {
        walletAddress,
        walletName,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        error,
    } = useWallet();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>StellarCrowd</h1>
            </div>

            <div className="wallet-section">
                {isConnected ? (
                    <div className="connected-wallet">
                        <div className="wallet-info">
                            <span className="wallet-name">
                                {walletName || "Stellar Wallet"}
                            </span>

                            <span className="wallet-address">
                                {shortenAddress(walletAddress)}
                            </span>
                        </div>

                        <button
                            className="disconnect-button"
                            onClick={disconnectWallet}
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        className="wallet-button"
                        onClick={connectWallet}
                        disabled={isConnecting}
                    >
                        {isConnecting
                            ? "Connecting..."
                            : "Connect Wallet"}
                    </button>
                )}

                {error && (
                    <p className="wallet-error">
                        {error}
                    </p>
                )}
            </div>
        </nav>
    );
}

export default Navbar;