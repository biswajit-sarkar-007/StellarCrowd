function DonateForm() {
    return (
        <section className="donate-card">
            <h2>Make a Donation</h2>

            <p>
                Support the campaign using XLM.
            </p>

            <label htmlFor="donation-amount">
                Donation Amount
            </label>

            <div className="amount-input">
                <input
                    id="donation-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5"
                />

                <span>XLM</span>
            </div>

            <button className="donate-button">
                Donate
            </button>
        </section>
    );
}

export default DonateForm;