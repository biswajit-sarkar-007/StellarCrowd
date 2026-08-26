import { useState } from "react";
import { useWallet } from "../context/WalletContext";

function DonationForm() {
    const {
        walletAddress,
        balance,
        donate,
        transactionStatus,
        transactionHash,
        transactionError,
        transactionStep,
    } = useWallet();

    const [amount, setAmount] = useState("");
    const [localError, setLocalError] = useState("");

    const presets = ["1", "5", "10", "25"];

    const isProcessing = [
        "preparing",
        "signing",
        "submitting",
        "confirming",
    ].includes(transactionStatus);

    const handlePreset = (value) => {
        setAmount(value);
        setLocalError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLocalError("");

        if (!walletAddress) {
            setLocalError(
                "Connect your wallet before making a donation."
            );
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setLocalError(
                "Enter a valid donation amount."
            );
            return;
        }

        if (
            balance !== null &&
            Number(amount) > Number(balance)
        ) {
            setLocalError(
                "Insufficient XLM balance."
            );
            return;
        }

        try {
            await donate(amount);
            setAmount("");
        } catch (error) {
            setLocalError(
                error?.message ||
                "Donation failed."
            );
        }
    };

    return (
        <section className="donation-card">

            {/* Header */}
            <div className="donation-header">
                <div>
                    <span className="donation-eyebrow">
                        SUPPORT THE CAMPAIGN
                    </span>

                    <h2>
                        Make a Donation
                    </h2>

                    <p>
                        Contribute XLM directly through
                        the Stellar network.
                    </p>
                </div>

                <div className="donation-icon">
                    ✦
                </div>
            </div>

            {/* Connected wallet */}
            {walletAddress ? (
                <div className="wallet-info">
                    <div>
                        <span>
                            Connected wallet
                        </span>

                        <strong>
                            {walletAddress.slice(0, 6)}
                            ...
                            {walletAddress.slice(-6)}
                        </strong>
                    </div>

                    <div className="wallet-balance">
                        <span>
                            Balance
                        </span>

                        <strong>
                            {balance !== null
                                ? `${Number(balance).toFixed(2)} XLM`
                                : "Loading..."}
                        </strong>
                    </div>
                </div>
            ) : (
                <div className="wallet-warning">
                    <span>⚠️</span>

                    <div>
                        <strong>
                            Wallet not connected
                        </strong>

                        <p>
                            Connect a Stellar wallet to donate.
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form
                className="donation-form"
                onSubmit={handleSubmit}
            >
                <div className="amount-header">
                    <label htmlFor="donation-amount">
                        Donation amount
                    </label>

                    <span>
                        XLM
                    </span>
                </div>

                <div className="amount-input-wrapper">
                    <input
                        id="donation-amount"
                        type="number"
                        min="0.0000001"
                        step="0.0000001"
                        value={amount}
                        onChange={(event) => {
                            setAmount(
                                event.target.value
                            );
                            setLocalError("");
                        }}
                        placeholder="0.00"
                        disabled={isProcessing}
                    />

                    <span>
                        XLM
                    </span>
                </div>

                {/* Presets */}
                <div className="preset-section">
                    <span>
                        Quick select
                    </span>

                    <div className="preset-buttons">
                        {presets.map((preset) => (
                            <button
                                type="button"
                                key={preset}
                                onClick={() =>
                                    handlePreset(preset)
                                }
                                disabled={isProcessing}
                                className={
                                    amount === preset
                                        ? "preset active"
                                        : "preset"
                                }
                            >
                                {preset} XLM
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {(localError ||
                    transactionStatus === "failed") && (
                        <div className="transaction-error">
                            <span>!</span>

                            <p>
                                {localError ||
                                    transactionError ||
                                    "Transaction failed."}
                            </p>
                        </div>
                    )}

                {/* Processing */}
                {transactionStatus ===
                    "preparing" && (
                        <div className="transaction-status">
                            <span className="status-spinner">
                                ◌
                            </span>

                            <div>
                                <strong>
                                    Preparing transaction
                                </strong>

                                <p>
                                    Building and simulating
                                    your donation.
                                </p>
                            </div>
                        </div>
                    )}

                {transactionStatus ===
                    "signing" && (
                        <div className="transaction-status">
                            <span className="status-spinner">
                                ◌
                            </span>

                            <div>
                                <strong>
                                    Waiting for approval
                                </strong>

                                <p>
                                    Confirm the transaction
                                    in your wallet.
                                </p>
                            </div>
                        </div>
                    )}

                {transactionStatus ===
                    "submitting" && (
                        <div className="transaction-status">
                            <span className="status-spinner">
                                ◌
                            </span>

                            <div>
                                <strong>
                                    Submitting transaction
                                </strong>

                                <p>
                                    Sending your transaction
                                    to Stellar Testnet.
                                </p>
                            </div>
                        </div>
                    )}

                {transactionStatus ===
                    "confirming" && (
                        <div className="transaction-status">
                            <span className="status-spinner">
                                ◌
                            </span>

                            <div>
                                <strong>
                                    Confirming donation
                                </strong>

                                <p>
                                    Waiting for Stellar
                                    confirmation.
                                </p>
                            </div>
                        </div>
                    )}

                {/* Submit */}
                <button
                    className="donate-button"
                    type="submit"
                    disabled={
                        !walletAddress ||
                        isProcessing
                    }
                >
                    {isProcessing ? (
                        <>
                            <span className="button-spinner">
                                ◌
                            </span>

                            Processing...
                        </>
                    ) : (
                        <>
                            Donate XLM
                            <span>→</span>
                        </>
                    )}
                </button>

                <p className="network-note">
                    🔒 Secured by Stellar Testnet
                </p>
            </form>
            {transactionStatus !== "idle" && (
                <div
                    className={`transaction-status ${transactionStatus}`}
                >

                    {transactionStatus === "pending" && (
                        <>
                            <div className="transaction-spinner" />

                            <div>
                                <strong>
                                    Transaction in progress
                                </strong>

                                <p>
                                    {transactionStep}
                                </p>
                            </div>
                        </>
                    )}


                    {transactionStatus === "success" && (
                        <>
                            <div className="transaction-success-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Donation successful
                                </strong>

                                <p>
                                    {transactionStep}
                                </p>

                                {transactionHash && (
                                    <a
                                        href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View transaction ↗
                                    </a>
                                )}
                            </div>
                        </>
                    )}


                    {transactionStatus === "failed" && (
                        <>
                            <div className="transaction-error-icon">
                                !
                            </div>

                            <div>
                                <strong>
                                    Donation failed
                                </strong>

                                <p>
                                    {transactionError ||
                                        transactionStep}
                                </p>
                            </div>
                        </>
                    )}

                </div>
            )}

            {/* Success */}
            {transactionStatus ===
                "success" && (
                    <div className="donation-success">
                        <div className="success-icon">
                            ✓
                        </div>

                        <div>
                            <h3>
                                Donation successful!
                            </h3>

                            <p>
                                Your contribution has been
                                recorded on the Stellar network.
                            </p>
                        </div>

                        {transactionHash && (
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="explorer-link"
                            >
                                View transaction
                                <span>↗</span>
                            </a>
                        )}
                    </div>
                )}

        </section>
    );
}

export default DonationForm;