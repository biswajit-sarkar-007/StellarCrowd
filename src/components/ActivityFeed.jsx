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


function ActivityFeed() {
    const [events, setEvents] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [lastLedger, setLastLedger] =
        useState(null);


    const loadEvents = useCallback(
        async () => {
            try {
                setError("");

                let startLedger =
                    lastLedger;

                /*
                 * First request:
                 * Start from the latest ledger.
                 */
                if (!startLedger) {
                    startLedger =
                        await getLatestLedger();
                }


                /*
                 * Fetch donation events
                 * from our contract.
                 */
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


                            /*
                             * Remove duplicate events.
                             */
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


                    /*
                     * Remember latest ledger.
                     */
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
            }
        },
        [lastLedger]
    );


    /*
     * Load events when component mounts
     * and every 5 seconds afterwards.
     */
    useEffect(() => {

        loadEvents();

        const interval =
            setInterval(
                loadEvents,
                5000
            );


        return () => {
            clearInterval(interval);
        };

    }, [loadEvents]);


    return (
        <section className="activity-card">

            <div className="activity-header">

                <div>

                    <span className="activity-eyebrow">
                        LIVE ACTIVITY
                    </span>

                    <h2>
                        Recent Donations
                    </h2>

                    <p>
                        Donations are synchronized
                        from the Stellar contract.
                    </p>

                </div>


                <span className="live-indicator">

                    <span />

                    LIVE

                </span>

            </div>


            {isLoading && (
                <div className="activity-empty">
                    Loading donations...
                </div>
            )}


            {error && (
                <div className="activity-error">
                    ❌ {error}
                </div>
            )}


            {!isLoading &&
                !error &&
                events.length === 0 && (

                    <div className="activity-empty">
                        No donations yet.
                    </div>

                )}


            <div className="activity-list">

                {events.map((event) => (

                    <DonationEventItem
                        key={event.id}
                        event={event}
                    />

                ))}

            </div>

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


    return (
        <article className="activity-item">

            <div className="activity-icon">
                ✓
            </div>


            <div className="activity-content">

                <strong>
                    New donation
                </strong>


                <p>

                    {formatAddress(donor)}

                    {" donated "}

                    <strong>

                        {formatAmount(amount)}

                        {" XLM"}

                    </strong>

                </p>

            </div>


            <span className="activity-ledger">

                #{event.ledger}

            </span>

        </article>
    );
}


export default ActivityFeed;