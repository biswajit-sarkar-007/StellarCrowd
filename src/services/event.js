import {
    scValToNative,
} from "@stellar/stellar-sdk";

import {
    Server,
} from "@stellar/stellar-sdk/rpc";

import {
    STELLAR_CONFIG,
} from "../config";


const server = new Server(
    STELLAR_CONFIG.rpcUrl
);


export async function getLatestLedger() {

    const response =
        await server.getLatestLedger();

    return response.sequence;
}


export async function getDonationEvents(
    startLedger
) {

    try {

        const response =
            await server.getEvents({

                startLedger,

                filters: [
                    {
                        type: "contract",

                        contractIds: [
                            STELLAR_CONFIG.contractId,
                        ],
                    },
                ],

                limit: 100,
            });


        return response.events.map(
            (event) => {

                let topics = [];
                let value = null;


                try {

                    topics =
                        event.topic?.map(
                            (topic) =>
                                scValToNative(
                                    topic
                                )
                        ) || [];


                    value =
                        scValToNative(
                            event.value
                        );

                } catch (decodeError) {

                    console.error(
                        "Event decoding failed:",
                        decodeError
                    );

                }


                return {

                    ...event,

                    decodedTopics:
                        topics,

                    decodedValue:
                        value,

                };

            }
        );

    } catch (error) {

        console.error(
            "Failed to fetch contract events:",
            error
        );

        throw error;
    }
}