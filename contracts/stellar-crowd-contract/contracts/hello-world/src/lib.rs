#![no_std]

use soroban_sdk::{
    contract,
    contractevent,
    contractimpl,
    token,
    Address,
    Env,
    Symbol,
};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DonationEvent {
    #[topic]
    pub donor: Address,
    pub amount: i128,
}

#[contract]
pub struct StellarCrowd;

#[contractimpl]
impl StellarCrowd {
    pub fn initialize(
        env: Env,
        token_address: Address,
    ) {
        let total_raised_key =
            Symbol::new(&env, "total_raised");

        let donor_count_key =
            Symbol::new(&env, "donor_count");

        let token_key =
            Symbol::new(&env, "token");

        if !env.storage().instance().has(&total_raised_key) {
            env.storage()
                .instance()
                .set(&total_raised_key, &0i128);
        }

        if !env.storage().instance().has(&donor_count_key) {
            env.storage()
                .instance()
                .set(&donor_count_key, &0u32);
        }

        if !env.storage().instance().has(&token_key) {
            env.storage()
                .instance()
                .set(&token_key, &token_address);
        }
    }

    pub fn donate(
        env: Env,
        donor: Address,
        amount: i128,
    ) {
        donor.require_auth();

        if amount <= 0 {
            panic!("Donation amount must be greater than zero");
        }

        let token_key =
            Symbol::new(&env, "token");

        let token_address: Address = env
            .storage()
            .instance()
            .get(&token_key)
            .unwrap();

        let token_client =
            token::Client::new(
                &env,
                &token_address,
            );

        let contract_address =
            env.current_contract_address();

        token_client.transfer(
            &donor,
            &contract_address,
            &amount,
        );

        let total_raised_key =
            Symbol::new(&env, "total_raised");

        let donor_count_key =
            Symbol::new(&env, "donor_count");

        let current_total: i128 = env
            .storage()
            .instance()
            .get(&total_raised_key)
            .unwrap_or(0);

        let current_donor_count: u32 = env
            .storage()
            .instance()
            .get(&donor_count_key)
            .unwrap_or(0);

        let new_total =
            current_total + amount;

        env.storage()
            .instance()
            .set(
                &total_raised_key,
                &new_total,
            );

        env.storage()
            .instance()
            .set(
                &donor_count_key,
                &(current_donor_count + 1),
            );

        DonationEvent {
            donor,
            amount,
        }
        .publish(&env);
    }

    pub fn get_total_raised(
        env: Env,
    ) -> i128 {
        let key =
            Symbol::new(&env, "total_raised");

        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(0)
    }

    pub fn get_donor_count(
        env: Env,
    ) -> u32 {
        let key =
            Symbol::new(&env, "donor_count");

        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(0)
    }

    pub fn get_token(
        env: Env,
    ) -> Address {
        let key =
            Symbol::new(&env, "token");

        env.storage()
            .instance()
            .get(&key)
            .unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    use soroban_sdk::{
        testutils::Address as _,
        token,
        Address,
        Env,
    };

    #[test]
    fn test_initialize() {
        let env = Env::default();

        let admin = Address::generate(&env);

        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();

        let contract_id = env.register(
            StellarCrowd,
            (),
        );

        let client = StellarCrowdClient::new(
            &env,
            &contract_id,
        );

        client.initialize(
            &token_address,
        );

        assert_eq!(
            client.get_total_raised(),
            0
        );

        assert_eq!(
            client.get_donor_count(),
            0
        );

        assert_eq!(
            client.get_token(),
            token_address
        );
    }

    #[test]
    fn test_donation() {
        let env = Env::default();

        let admin = Address::generate(&env);

        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();

        let token_client =
            token::StellarAssetClient::new(
                &env,
                &token_address,
            );

        let contract_id = env.register(
            StellarCrowd,
            (),
        );

        let client = StellarCrowdClient::new(
            &env,
            &contract_id,
        );

        client.initialize(
            &token_address,
        );

        let donor =
            Address::generate(&env);

        env.mock_all_auths();

        // Give the donor 1000 test tokens.
        token_client.mint(
            &donor,
            &1000,
        );

        // Verify donor initially has 1000.
        assert_eq!(
            token::Client::new(
                &env,
                &token_address,
            )
            .balance(&donor),
            1000
        );

        // Donate 100.
        client.donate(
            &donor,
            &100,
        );

        // Verify accounting.
        assert_eq!(
            client.get_total_raised(),
            100
        );

        assert_eq!(
            client.get_donor_count(),
            1
        );

        // Verify donor lost 100.
        assert_eq!(
            token::Client::new(
                &env,
                &token_address,
            )
            .balance(&donor),
            900
        );

        // Verify contract received 100.
        assert_eq!(
            token::Client::new(
                &env,
                &token_address,
            )
            .balance(&contract_id),
            100
        );
    }

    #[test]
    #[should_panic]
    fn test_zero_donation_fails() {
        let env = Env::default();

        let admin =
            Address::generate(&env);

        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();

        let contract_id = env.register(
            StellarCrowd,
            (),
        );

        let client = StellarCrowdClient::new(
            &env,
            &contract_id,
        );

        client.initialize(
            &token_address,
        );

        let donor =
            Address::generate(&env);

        env.mock_all_auths();

        client.donate(
            &donor,
            &0,
        );
    }
}