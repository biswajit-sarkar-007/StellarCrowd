function ActivityFeed() {
    return (
        <section className="activity-card">
            <div className="activity-header">
                <h2>Recent Activity</h2>

                <span className="live-indicator">
                    LIVE
                </span>
            </div>

            <div className="empty-activity">
                <p>
                    No donations yet.
                </p>
            </div>
        </section>
    );
}

export default ActivityFeed;