import {
    StellarWalletsKit,
    WalletNetwork,
    allowAllModules,
} from "@creit.tech/stellar-wallets-kit";

const walletKit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    modules: allowAllModules(),
});

export const walletService = {
    async connect(onWalletSelected) {
        return walletKit.openModal({
            onWalletSelected: async (wallet) => {
                try {
                    await walletKit.setWallet(wallet.id);

                    const { address } = await walletKit.getAddress();

                    onWalletSelected({
                        address,
                        walletId: wallet.id,
                        walletName: wallet.name,
                    });
                } catch (error) {
                    console.error("Wallet connection failed:", error);

                    throw error;
                }
            },

            onClosed: (error) => {
                if (error) {
                    console.error("Wallet modal closed:", error);
                }
            },
        });
    },

    async disconnect() {
        try {
            await walletKit.disconnect();
        } catch (error) {
            console.error("Wallet disconnect failed:", error);
        }
    },

    async getAddress() {
        const { address } = await walletKit.getAddress();

        return address;
    },

    async signTransaction(xdr, address) {
        return walletKit.signTransaction(xdr, {
            address,
            networkPassphrase: WalletNetwork.TESTNET,
        });
    },
};