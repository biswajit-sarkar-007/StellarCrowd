#![no_std]

use soroban_sdk::{
    contract,
    contractimpl,
    Address,
    Env,
    Symbol,
};

#[contract]
pub struct StellarCrowd;

#[contractimpl]
impl StellarCrowd {
    pub fn initialize(env: Env) {
        let total_raised_key = Symbol::new(&env, "total_raised");
        let donor_count_key = Symbol::new(&env, "donor_count");

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
    }

    pub fn donate(env: Env, donor: Address, amount: i128) {
        donor.require_auth();

        if amount <= 0 {
            panic!("Donation amount must be greater than zero");
        }

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

        let new_total = current_total + amount;

        env.storage()
            .instance()
            .set(&total_raised_key, &new_total);

        env.storage()
            .instance()
            .set(
                &donor_count_key,
                &(current_donor_count + 1),
            );

        env.events().publish(
            (Symbol::new(&env, "donation"), donor),
            amount,
        );
    }

    pub fn get_total_raised(env: Env) -> i128 {
        let key =
            Symbol::new(&env, "total_raised");

        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(0)
    }

    pub fn get_donor_count(env: Env) -> u32 {
        let key =
            Symbol::new(&env, "donor_count");

        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        Address,
        Env,
    };

    #[test]
    fn test_initialize() {
        let env = Env::default();

        let contract_id =
            env.register(StellarCrowd, ());

        let client =
            StellarCrowdClient::new(
                &env,
                &contract_id,
            );

        client.initialize();

        assert_eq!(
            client.get_total_raised(),
            0
        );

        assert_eq!(
            client.get_donor_count(),
            0
        );
    }

    #[test]
    fn test_donation() {
        let env = Env::default();

        let contract_id =
            env.register(StellarCrowd, ());

        let client =
            StellarCrowdClient::new(
                &env,
                &contract_id,
            );

        client.initialize();

        let donor =
            Address::generate(&env);

        env.mock_all_auths();

        client.donate(
            &donor,
            &100,
        );

        assert_eq!(
            client.get_total_raised(),
            100
        );

        assert_eq!(
            client.get_donor_count(),
            1
        );
    }

    #[test]
    #[should_panic]
    fn test_zero_donation_fails() {
        let env = Env::default();

        let contract_id =
            env.register(StellarCrowd, ());

        let client =
            StellarCrowdClient::new(
                &env,
                &contract_id,
            );

        client.initialize();

        let donor =
            Address::generate(&env);

        env.mock_all_auths();

        client.donate(
            &donor,
            &0,
        );
    }
}