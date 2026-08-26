import { useWallet } from "../context/WalletContext";

function TransactionStatus() {
    const { transactionStatus, transactionHash, transactionError } = useWallet();

    if (!transactionStatus && !transactionError) {
        return (
            <section className="transaction-status">
                <h2>Transaction Status</h2>
                <p>No transaction yet.</p>
            </section>
        );
    }

    return (
        <section className="transaction-status">
            <h2>Transaction Status</h2>

            {transactionError && (
                <p>
                    ❌ {transactionError}
                </p>
            )}

            {transactionStatus === "pending" && (
                <p>
                    ⏳ Transaction pending...
                </p>
            )}

            {transactionStatus === "success" && (
                <div>
                    <p>
                        ✅ Donation successful!
                    </p>
                    {transactionHash && (
                        <p>
                            Transaction:
                            <br />
                            <code>{transactionHash}</code>
                        </p>
                    )}
                </div>
            )}

            {transactionStatus === "failed" && (
                <p>
                    ❌ Transaction failed.
                </p>
            )}
        </section>
    );
}

export default TransactionStatus;