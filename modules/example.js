// example.js
import aipriceAnalyzer from './aipriceAnalyzer.js';
import fs from 'fs';
import path from 'path';

async function processAllImages() {
    const folderPath = './file';
    const outputFolder = './results';

    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
        console.error(`Error: Folder not found at ${folderPath}`);
        console.log('\nTip: Create a "./file" folder and add your item images.');
        process.exit(1);
    }

    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Get all image files from the folder
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    });

    if (imageFiles.length === 0) {
        console.error(`No image files found in ${folderPath}`);
        console.log('\nSupported formats: .jpg, .jpeg, .png, .gif, .bmp, .webp');
        process.exit(1);
    }

    console.log(`Found ${imageFiles.length} image(s) to process\n`);

    // Initialize the analyzer
    const analyzer = new aipriceAnalyzer();
    const allResults = [];

    // Process each image
    for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const imagePath = path.join(folderPath, fileName);

        console.log(`Processing [${i + 1}/${imageFiles.length}]: ${fileName}`);

        try {
            // Run the analysis
            const result = await analyzer.analyzeItem(imagePath);

            // Add filename to result
            result.sourceImage = fileName;
            allResults.push(result);

            console.log(`  ✓ Successfully processed ${fileName}`);

        } catch (error) {
            console.error(`  ✗ Failed to process ${fileName}: ${error.message}`);

            // Log failed file
            allResults.push({
                sourceImage: fileName,
                status: 'failed',
                error: error.message
            });
        }

        // Add delay between requests to avoid rate limiting
        if (i < imageFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Create batch report
    const successfulAnalyses = allResults.filter(r => !r.error);
    const failedAnalyses = allResults.filter(r => r.error);

    const batchReport = {
        processedAt: new Date().toISOString(),
        totalFiles: imageFiles.length,
        successful: successfulAnalyses.length,
        failed: failedAnalyses.length,
        results: allResults
    };

    // Save batch report
    const batchReportFile = path.join(outputFolder, 'batch_report.json');
    fs.writeFileSync(batchReportFile, JSON.stringify(batchReport, null, 2));

    console.log(`\nBatch report saved: ${batchReportFile}`);
    console.log(`Total: ${imageFiles.length} | Success: ${successfulAnalyses.length} | Failed: ${failedAnalyses.length}`);
}

// Run the batch processor
processAllImages().catch(error => {
    console.error('\nFatal Error:', error.message);
    process.exit(1);
});