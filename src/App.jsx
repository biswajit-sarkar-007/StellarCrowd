import Navbar from "./components/Navbar";
import WalletBalance from "./components/WalletBalance";
import CampaignStats from "./components/CampaignCrad";
import DonateForm from "./components/DonateForm";
import ActivityFeed from "./components/ActivityFeed";

import { useWallet } from "./context/WalletContext";

function App() {
  const {
    walletAddress,
  } = useWallet();

  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <section className="hero">
          <p className="hero-label">
            STELLAR TESTNET
          </p>

          <h1>
            Support Something Meaningful
          </h1>

          <p className="hero-description">
            Decentralized Stellar Crowdfunding
          </p>
        </section>

        <section className="dashboard">
          <CampaignStats />
          <WalletBalance />
        </section>

        <DonateForm />

        <ActivityFeed />

      </main>
    </div>
  );
}

export default App;