const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

const inputFiles = ['file1.csv']; // Add your CSV file names here
const outputFile = 'output.json';

const results = [];

function processFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const contractName = row.contract_identifier.split('.').pop();
                const item = {
                    name: `${contractName}-${row.method}`,
                    uuid: uuidv4(),
                    chain: "stacks",
                    version: 1,
                    networks: {
                        mainnet: {
                            if_this: {
                                scope: "contract_call",
                                method: row.method,
                                contract_identifier: row.contract_identifier
                            },
                            end_block: null,
                            then_that: {
                                http_post: {
                                    url: "https://charisma.rocks/api/chainhooks",
                                    authorization_header: ""
                                }
                            },
                            start_block: 158201,
                            decode_clarity_values: true,
                            expire_after_occurrence: null
                        }
                    }
                };
                results.push(item);
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function processAllFiles() {
    for (const file of inputFiles) {
        await processFile(file);
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`JSON file created: ${outputFile}`);
}

processAllFiles().catch((error) => {
    console.error('Error processing files:', error);
});