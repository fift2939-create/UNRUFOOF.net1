const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const publicDir = path.join(__dirname, 'js'); // We will place the final data file in the existing js folder
const outputFilePath = path.join(publicDir, 'site-data.js');

async function build() {
    console.log('Starting build process...');

    const collections = ['novels', 'books', 'initiatives', 'jobs', 'partners'];
    const allData = {};

    try {
        for (const collectionName of collections) {
            const filePath = path.join(dataDir, `${collectionName}.json`);
            try {
                const fileContent = await fs.readFile(filePath, 'utf-8');
                allData[collectionName] = JSON.parse(fileContent);
                console.log(`✅ Successfully read ${collectionName}.json`);
            } catch (readError) {
                if (readError.code === 'ENOENT') {
                    console.warn(`🟡 Warning: ${collectionName}.json not found. Skipping.`);
                    allData[collectionName] = [];
                } else {
                    throw readError;
                }
            }
        }

        // Create the content for the output file
        const outputFileContent = `window.SITE_DATA = ${JSON.stringify(allData, null, 2)};`;

        // Ensure the public directory exists
        await fs.mkdir(publicDir, { recursive: true });

        // Write the final data file
        await fs.writeFile(outputFilePath, outputFileContent, 'utf-8');
        console.log(`
🎉 Build successful!`);
        console.log(`Data file created at: ${outputFilePath}`);
        console.log('You can now commit and push your files to GitHub.');

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
