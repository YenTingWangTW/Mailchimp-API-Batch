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
        name: 'tagName',
        message: 'Tag name',
    },
    {
        type: 'confirm',
        name: 'deactivateTag',
        message: 'Deactivate the target tag?',
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


async function updateTag() {questions,
    args = await prompt(questions);
    console.dir(`Tag update: ${args.tagName}, Tag active? ${args.deactivateTag}`);
    return args;
};

async function confirmUpdate(emails, args) {confirm,
    confirmGo = await prompt(confirm);
    try {
        let payloads = [];

        console.dir(`ready to go: ${confirmGo.go}`);
        console.dir({
            tag: args.tagName,
            tagDeactive: !!args.deactivateTag,
            list: args.list,
            secret: args.secret,
        });

        if (!confirmGo.go) {
            console.error('Please double check and answer Yes to proceed.');
            process.exit();
        }


        for (let i = 0; i < emails.length; i += 1) {
            const body = {
                tags: [{
                    name: args.tagName,
                    status: args.deactivateTag ? 'inactive' : 'active',
                }, ],
            };

            payloads.push({
                method: 'post',
                path: `lists/${args.list}/members/${md5(emails[i])}/tags`,
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
        process.exit();
    };
    
};


program

    .version('0.1.0')
        .command('Tag update') // No need of specifying arguments here
        .alias('t')
        .description('update user tag')
        .action(async () => {
            args = await updateTag();
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
