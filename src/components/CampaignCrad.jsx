import { useEffect, useState, useCallback } from "react";

import { stellarService } from "../services/steller";
import { useWallet } from "../context/WalletContext";


function CampaignStats() {
    const { donationCount } = useWallet();

    const [totalRaised, setTotalRaised] =
        useState(null);

    const [donorCount, setDonorCount] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadStats = useCallback(async () => {
        try {
            setError("");

            const [
                total,
                donors,
            ] = await Promise.all([
                stellarService.getTotalRaised(),
                stellarService.getDonorCount(),
            ]);

            const totalNum = Number(total);
            const donorsNum = Number(donors);

            setTotalRaised(
                isNaN(totalNum) ? 0 : totalNum / 10_000_000
            );

            setDonorCount(
                isNaN(donorsNum) ? 0 : donorsNum
            );

        } catch (err) {

            console.error(
                "Campaign stats error:",
                err
            );

            setError(
                "Unable to load campaign statistics."
            );

        } finally {
            setIsLoading(false);
        }
    }, []);


    // Refresh whenever page loads or a donation completes
    useEffect(() => {
        loadStats();
    }, [loadStats, donationCount]);

    // Also poll every 10 seconds
    useEffect(() => {
        const interval = setInterval(loadStats, 10_000);
        return () => clearInterval(interval);
    }, [loadStats]);


    return (
        <section className="campaign-stats">

            <div className="stats-header">

                <span>
                    CAMPAIGN STATS
                </span>

                <span className="stats-live">
                    ● LIVE
                </span>

            </div>


            {isLoading ? (
                <div className="stats-grid">
                    <div className="stat-item">
                        <span>Total Raised</span>
                        <strong className="stat-loading">—</strong>
                    </div>
                    <div className="stat-item">
                        <span>Donors</span>
                        <strong className="stat-loading">—</strong>
                    </div>
                </div>
            ) : error ? (
                <p className="stats-error">
                    {error}
                </p>
            ) : (
                <div className="stats-grid">

                    <div className="stat-item">

                        <span>
                            Total Raised
                        </span>

                        <strong>
                            {totalRaised} XLM
                        </strong>

                    </div>


                    <div className="stat-item">

                        <span>
                            Donors
                        </span>

                        <strong>
                            {donorCount}
                        </strong>

                    </div>

                </div>
            )}

        </section>
    );
}


export default CampaignStats;