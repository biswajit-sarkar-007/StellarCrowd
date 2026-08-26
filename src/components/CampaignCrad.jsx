function CampaignCard() {
    return (
        <section className="campaign-card">
            <p className="campaign-label">
                COMMUNITY FUND
            </p>

            <h2>
                Help Build Our Community Lab
            </h2>

            <p className="campaign-description">
                Support our community project by
                contributing XLM on Stellar Testnet.
            </p>

            <div className="campaign-stats">
                <div>
                    <span>Goal</span>
                    <strong>100 XLM</strong>
                </div>

                <div>
                    <span>Raised</span>
                    <strong>0 XLM</strong>
                </div>

                <div>
                    <span>Donors</span>
                    <strong>0</strong>
                </div>
            </div>

            <div className="progress-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: "0%" }}
                    />
                </div>

                <span>0%</span>
            </div>
        </section>
    );
}

export default CampaignCard;