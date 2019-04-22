const axios = require('axios');


const sleep = (ms) => {
    Promise(resolve => setTimeout(resolve, ms));
};

async function doBatch(secret, payloads) {
    try {
        const apiVersion = '3.0';
        const endpoint = `https://${secret.split('-')[1]}.api.mailchimp.com`;
        const result = await axios.post(`${endpoint}/${apiVersion}/batches`, {
            operations: payloads
        }, {
                auth: {
                    username: 'useless',
                    password: secret,
                },
            });
        console.dir({
            id: result.data.id,
            status: result.data.status,
        });
        (async () => {
            try {
                await sleep(3000);
            } catch (err) {
                //
            }

            console.log('sleep for a while');
        })();
        // checkBatch(secret, result.data.id);
    } catch (err) {
        // console.dir(err.response);
        process.exit();
    }
};

module.exports.doBatch = doBatch;