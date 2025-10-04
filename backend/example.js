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
    console.log('='.repeat(70));

    // Initialize the analyzer
    const analyzer = new aipriceAnalyzer();
    const allResults = [];
    let totalCO2SavedKg = 0;

    // Process each image
    for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const imagePath = path.join(folderPath, fileName);

        console.log(`\n📦 Processing [${i + 1}/${imageFiles.length}]: ${fileName}`);
        console.log('-'.repeat(70));

        try {
            // Run the analysis
            const result = await analyzer.analyzeItem(imagePath);

            // Add filename to result
            result.sourceImage = fileName;
            allResults.push(result);

            // Display summary for this item
            console.log(`\n✅ Successfully analyzed: ${result.itemInfo.itemName}`);
            console.log(`\n💰 PRICING:`);
            console.log(`   Average Price: $${result.currentSellingPrice.average}`);
            console.log(`   Price Range: $${result.currentSellingPrice.lowest} - $${result.currentSellingPrice.highest}`);
            console.log(`   Recommendation: ${result.recommendation.action}`);

            console.log(`\n🌱 ENVIRONMENTAL IMPACT:`);
            console.log(`   CO2 Saved: ${result.environmentalImpact.co2SavedKg} kg (${result.environmentalImpact.co2SavedLbs} lbs)`);
            console.log(`   Equivalent to: ${result.environmentalImpact.equivalentTrees} trees planted`);
            console.log(`   Car miles offset: ${result.environmentalImpact.equivalentCarMiles} miles`);
            console.log(`   Impact: ${result.environmentalImpact.comparisonMetric}`);

            // Add to total CO2 saved
            totalCO2SavedKg += parseFloat(result.environmentalImpact.co2SavedKg);

            // Save individual result
            const individualFile = path.join(outputFolder, `${path.parse(fileName).name}_analysis.json`);
            fs.writeFileSync(individualFile, JSON.stringify(result, null, 2));
            console.log(`\n📄 Individual report saved: ${individualFile}`);

        } catch (error) {
            console.error(`\n❌ Failed to process ${fileName}: ${error.message}`);

            // Log failed file
            allResults.push({
                sourceImage: fileName,
                status: 'failed',
                error: error.message
            });
        }

        // Add delay between requests to avoid rate limiting
        if (i < imageFiles.length - 1) {
            console.log('\n⏳ Waiting 2 seconds before next analysis...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Create batch report
    const successfulAnalyses = allResults.filter(r => !r.error);
    const failedAnalyses = allResults.filter(r => r.error);

    // Calculate environmental totals
    const totalCarMilesOffset = successfulAnalyses.reduce((sum, r) =>
        sum + parseInt(r.environmentalImpact?.equivalentCarMiles || 0), 0);
    const totalTreesEquivalent = successfulAnalyses.reduce((sum, r) =>
        sum + parseInt(r.environmentalImpact?.equivalentTrees || 0), 0);

    const batchReport = {
        processedAt: new Date().toISOString(),
        summary: {
            totalFiles: imageFiles.length,
            successful: successfulAnalyses.length,
            failed: failedAnalyses.length,
            totalCO2SavedKg: totalCO2SavedKg.toFixed(2),
            totalCO2SavedLbs: (totalCO2SavedKg * 2.20462).toFixed(2),
            totalCarMilesOffset: totalCarMilesOffset,
            totalTreesEquivalent: totalTreesEquivalent
        },
        environmentalImpact: {
            message: `By reselling these ${successfulAnalyses.length} items instead of discarding them, you're saving ${totalCO2SavedKg.toFixed(2)} kg of CO2 emissions!`,
            comparison: `That's equivalent to planting ${totalTreesEquivalent} trees or offsetting ${totalCarMilesOffset} miles of car travel.`
        },
        results: allResults
    };

    // Save batch report
    const batchReportFile = path.join(outputFolder, 'batch_report.json');
    fs.writeFileSync(batchReportFile, JSON.stringify(batchReport, null, 2));

    // Display final summary
    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 BATCH PROCESSING COMPLETE!');
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Files: ${imageFiles.length}`);
    console.log(`   ✅ Successful: ${successfulAnalyses.length}`);
    console.log(`   ❌ Failed: ${failedAnalyses.length}`);

    console.log('\n🌍 TOTAL ENVIRONMENTAL IMPACT:');
    console.log(`   Total CO2 Saved: ${totalCO2SavedKg.toFixed(2)} kg (${(totalCO2SavedKg * 2.20462).toFixed(2)} lbs)`);
    console.log(`   Equivalent Trees: ${totalTreesEquivalent} trees planted`);
    console.log(`   Car Miles Offset: ${totalCarMilesOffset} miles`);

    console.log(`\n💾 Batch report saved: ${batchReportFile}`);
    console.log('\n' + '='.repeat(70));
}

// Run the batch processor
processAllImages().catch(error => {
    console.error('\nFatal Error:', error.message);
    process.exit(1);
});