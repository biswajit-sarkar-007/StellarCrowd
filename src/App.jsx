import Navbar from "./components/Navbar";
import WalletBalance from "./components/WalletBalance";
import CampaignCard from "./components/CampaignCrad";
import DonateForm from "./components/DonateForm";
import TransactionStatus from "./components/TransactionStatus";
import ActivityFeed from "./components/ActivityFeed";
import ContractStats from "./components/ContractStats";
import { useState } from "react";


function App() {
  const [walletAddress, setWalletAddress] =
    useState("");

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

          <DonateForm />
        </section>

        <TransactionStatus />

        <ActivityFeed />
        <ContractStats
          walletAddress={walletAddress}
        />
      </main>
    </div>
  );
}

export default App;