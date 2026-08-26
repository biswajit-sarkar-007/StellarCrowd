import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getDonationEvents,
    getLatestLedger,
} from "../services/event";


function formatAddress(address) {
    if (!address) {
        return "Unknown";
    }

    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}


function formatAmount(amount) {
    return Number(amount) / 10_000_000;
}


function formatTime(timestamp) {
    if (!timestamp) {
        return "Just now";
    }

    const date =
        new Date(timestamp * 1000);

    const seconds =
        Math.floor(
            (Date.now() - date.getTime()) /
            1000
        );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(hours / 24);

    return `${days}d ago`;
}


function ActivityFeed() {
    const [events, setEvents] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isRefreshing, setIsRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [lastLedger, setLastLedger] =
        useState(null);


    const loadEvents = useCallback(
        async (manual = false) => {
            try {
                setError("");

                if (manual) {
                    setIsRefreshing(true);
                }

                let startLedger =
                    lastLedger;

                if (!startLedger) {
                    startLedger =
                        await getLatestLedger();
                }

                const newEvents =
                    await getDonationEvents(
                        startLedger
                    );

                if (
                    newEvents.length > 0
                ) {
                    setEvents(
                        (previous) => {
                            const combined = [
                                ...newEvents,
                                ...previous,
                            ];

                            const unique =
                                Array.from(
                                    new Map(
                                        combined.map(
                                            (event) => [
                                                event.id,
                                                event,
                                            ]
                                        )
                                    ).values()
                                );

                            return unique.slice(
                                0,
                                20
                            );
                        }
                    );

                    const latest =
                        Math.max(
                            ...newEvents.map(
                                (event) =>
                                    Number(
                                        event.ledger
                                    )
                            )
                        );

                    setLastLedger(
                        latest
                    );
                }

            } catch (error) {

                console.error(
                    "Activity feed error:",
                    error
                );

                setError(
                    "Unable to load recent donations."
                );

            } finally {

                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [lastLedger]
    );


    useEffect(() => {
        loadEvents();

        const interval =
            setInterval(
                () => loadEvents(),
                5000
            );

        return () => {
            clearInterval(interval);
        };
    }, [loadEvents]);


    return (
        <section className="activity-card">

            {/* Header */}

            <div className="activity-header">

                <div>

                    <div className="activity-title-row">

                        <span className="activity-eyebrow">
                            LIVE ACTIVITY
                        </span>

                        <span className="live-indicator">
                            <span />
                            LIVE
                        </span>

                    </div>

                    <h2>
                        Recent Donations
                    </h2>

                    <p>
                        Live donation events from
                        the Stellar smart contract.
                    </p>

                </div>


                <button
                    className="activity-refresh"
                    onClick={() =>
                        loadEvents(true)
                    }
                    disabled={isRefreshing}
                    title="Refresh activity"
                >
                    {isRefreshing
                        ? "⟳"
                        : "↻"}
                </button>

            </div>


            {/* Loading */}

            {isLoading && (
                <div className="activity-loading">

                    <div className="activity-spinner" />

                    <span>
                        Loading recent donations...
                    </span>

                </div>
            )}


            {/* Error */}

            {error && (
                <div className="activity-error">

                    <span>!</span>

                    <div>
                        <strong>
                            Unable to load activity
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                </div>
            )}


            {/* Empty */}

            {!isLoading &&
                !error &&
                events.length === 0 && (

                    <div className="activity-empty">

                        <div className="empty-icon">
                            ✦
                        </div>

                        <strong>
                            No donations yet
                        </strong>

                        <p>
                            Be the first person to
                            support this campaign.
                        </p>

                    </div>
                )}


            {/* Events */}

            {!error &&
                events.length > 0 && (

                    <div className="activity-list">

                        {events.map(
                            (event) => (
                                <DonationEventItem
                                    key={event.id}
                                    event={event}
                                />
                            )
                        )}

                    </div>
                )}

        </section>
    );
}


function DonationEventItem({
    event,
}) {
    const donor =
        event.decodedTopics?.[0] ||
        "Unknown";

    const amount =
        event.decodedValue ||
        0;

    const timestamp =
        event.ledgerClosedAt;

    return (
        <article className="activity-item">

            <div className="activity-icon">
                ✓
            </div>


            <div className="activity-content">

                <div className="activity-event-title">

                    <strong>
                        New donation
                    </strong>

                    <span>
                        {formatTime(
                            timestamp
                        )}
                    </span>

                </div>


                <p>

                    <span className="donor-address">
                        {formatAddress(
                            donor
                        )}
                    </span>

                    {" donated "}

                    <strong>
                        {formatAmount(
                            amount
                        )}{" "}
                        XLM
                    </strong>

                </p>


                <span className="activity-ledger">
                    Ledger #{event.ledger}
                </span>

            </div>


            <a
                href={`https://stellar.expert/explorer/testnet/contract/${event.contractId}`}
                target="_blank"
                rel="noreferrer"
                className="activity-link"
                title="View on Stellar Expert"
            >
                ↗
            </a>

        </article>
    );
}


export default ActivityFeed;