const fs = require('fs');
const md5 = require('md5');
const parse = require('csv-parse');
const program = require('commander');
const { prompt } = require('inquirer');
const doBatchModule = require('./doBatch');
const doBatch = doBatchModule.doBatch;


function validateApi(status) {
    var reg = /[a-z0-9]+-us\d{2}/;
    return reg.test(status) || "Not returning full API!";
}


function validateStatus(status) {
    var reg = /^(cleaned|unsubscribed|subscribed)$/i;
    return reg.test(status) || "No matching status!";
}

function validateBatchSize(size) {
    var reg = /^\d+$/;
    return reg.test(size) || "Batch size should be a number!";
}


const questions = [{
        type: 'input',
        name: 'path',
        message: 'File Path'
    },
    {
        type: 'input',
        name: 'type',
        message: 'Target Status (cleaned|unsubscribed|subscribed)',
        validate: validateStatus
    },
    {
        type: 'input',
        name: 'list',
        message: 'Target List ID'
    },
    {
        type: 'input',
        name: 'secret',
        message: 'Target API Key',
        validate: validateApi
    },
    {
        type: 'input',
        name: 'batchSize',
        message: 'Target Batch Size',
        validate: validateBatchSize
    },
];

const confirm = [{
    type: 'confirm',
    name: 'go',
    message: 'Ready to go?'
}];



async function update() {questions,
    args = await prompt(questions);
    console.dir(`status update: ${args.type}`);
    return args;
};

async function confirmUpdate(emails, args) {confirm,
    confirmGo = await prompt(confirm);
    try {
        let payloads = [];

        console.dir(`ready to go: ${confirmGo.go}`);
        console.dir([args.type, args.secret, args.list]);

        if (!confirmGo.go) {
            console.error('Please double check and answer Yes to proceed.');
            process.exit();
        }


        for (let i = 0; i < emails.length; i += 1) {
            const body = {
                status: args.type,
                merge_fields: {
                    //ISMEMBER: '1',
                },
            };

            payloads.push({
                method: 'patch',
                path: `lists/${args.list}/members/${md5(emails[i])}`,
                body: JSON.stringify(body),
            });

            if (payloads.length >= args.batchSize) {
                doBatch(args.secret, payloads);
                payloads = [];
            }
        }

        if (payloads.length) {
            doBatch(args.secret, payloads);
        }

    } catch (err) {
        console.error(err);
    };
};


program

    .version('0.1.0')
    .command('Status update') // No need of specifying arguments here
    .alias('s')
    .description('update user status')
    .action(async () => {
        args = await update();
        fs.accessSync(args.path);
        parse(fs.readFileSync(args.path).toString(), {
            skip_empty_lines: true
        }, (err, data) => {
            emails = data.map(line => line[0].toLowerCase());
            emails.shift();
            console.dir(emails);
            confirmUpdate(emails, args);
        });

    })


program.parse(process.argv);