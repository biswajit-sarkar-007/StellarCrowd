import Navbar from "./components/Navbar";
import WalletBalance from "./components/WalletBalance";
import CampaignCard from "./components/CampaignCrad";
import DonateForm from "./components/DonateForm";
import TransactionStatus from "./components/TransactionStatus";
import ActivityFeed from "./components/ActivityFeed";
import ContractStats from "./components/ContractStats";

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
            Fund the future,
            <br />
            one XLM at a time.
          </h1>

          <p className="hero-description">
            A real-time crowdfunding application
            powered by Stellar smart contracts.
          </p>
        </section>

        <WalletBalance />

        <section className="dashboard">
          <CampaignCard />
        </section>

        <ContractStats
          walletAddress={walletAddress}
        />

        <DonateForm />

        <TransactionStatus />

        <ActivityFeed />

      </main>
    </div>
  );
}

export default App;