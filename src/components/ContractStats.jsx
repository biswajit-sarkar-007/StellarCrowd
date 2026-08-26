import { useEffect, useState } from "react";

import {
    getTotalRaised,
    getDonorCount,
} from "../services/contract";

function ContractStats({
    walletAddress,
}) {
    const [totalRaised, setTotalRaised] =
        useState(null);

    const [donorCount, setDonorCount] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!walletAddress) {
            return;
        }

        async function loadStats() {
            try {
                setLoading(true);
                setError("");

                const [
                    total,
                    donors,
                ] = await Promise.all([
                    getTotalRaised(walletAddress),
                    getDonorCount(walletAddress),
                ]);

                setTotalRaised(
                    total?.toString() ?? "0"
                );

                setDonorCount(
                    donors?.toString() ?? "0"
                );
            } catch (err) {
                console.error(err);

                setError(
                    "Failed to load contract data."
                );
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, [walletAddress]);

    if (!walletAddress) {
        return (
            <div>
                Connect your wallet to view
                crowdfunding statistics.
            </div>
        );
    }

    if (loading) {
        return (
            <div>
                Loading contract data...
            </div>
        );
    }

    if (error) {
        return (
            <div>
                {error}
            </div>
        );
    }

    return (
        <section>
            <h2>StellarCrowd</h2>

            <div>
                <h3>Total Raised</h3>

                <p>
                    {totalRaised ?? "0"} XLM
                </p>
            </div>

            <div>
                <h3>Donors</h3>

                <p>
                    {donorCount ?? "0"}
                </p>
            </div>
        </section>
    );
}

export default ContractStats;