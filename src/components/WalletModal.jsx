function WalletModal() {
    return (
        <div className="wallet-modal">
            <h2>Connect Wallet</h2>

            <p>
                Choose a Stellar wallet to continue.
            </p>

            <div className="wallet-options">
                <button>Freighter</button>
                <button>Albedo</button>
                <button>Lobstr</button>
            </div>
        </div>
    );
}

export default WalletModal;