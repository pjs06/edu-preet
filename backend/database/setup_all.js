#!/usr/bin/env node

/**
 * Complete Database Setup Script
 * Runs all migration and data loading scripts in the correct order
 */

const { execSync } = require('child_process');
const path = require('path');

const steps = [
    {
        name: 'Database Migration',
        command: 'node database/migrate.js',
        description: 'Creating all database tables...'
    },
    {
        name: 'Test Questions Table',
        command: 'node database/add_test_questions_table.js',
        description: 'Adding test_questions table...'
    },
    {
        name: 'Load Curriculum',
        command: 'node database/loaders/load_curriculum.js',
        description: 'Loading 5 curriculum modules...'
    },
    {
        name: 'Load Textbook Chunks',
        command: 'node database/loaders/load_textbook.js',
        description: 'Loading 10 textbook chunks...'
    },
    {
        name: 'Load Test Questions',
        command: 'node database/loaders/load_tests.js',
        description: 'Loading test questions...'
    },
    {
        name: 'Verify Data',
        command: 'node database/verify_data.js',
        description: 'Verifying all data loaded correctly...'
    }
];

console.log('\n' + '='.repeat(70));
console.log('🚀 STARTING COMPLETE DATABASE SETUP');
console.log('='.repeat(70) + '\n');

let successCount = 0;
let failedSteps = [];

for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`\n[${i + 1}/${steps.length}] ${step.name}`);
    console.log(`    ${step.description}`);
    console.log('-'.repeat(70));

    try {
        const output = execSync(step.command, {
            cwd: path.join(__dirname, '..'),
            encoding: 'utf8',
            stdio: 'pipe'
        });

        console.log(output);
        console.log(`✅ ${step.name} - SUCCESS\n`);
        successCount++;

    } catch (error) {
        console.error(`❌ ${step.name} - FAILED`);
        console.error(`Error: ${error.message}`);
        if (error.stdout) console.log('Output:', error.stdout);
        if (error.stderr) console.error('Error details:', error.stderr);
        failedSteps.push(step.name);

        // Stop on critical errors (migration or table creation)
        if (i < 2) {
            console.error('\n⚠️  Critical step failed. Stopping setup.\n');
            break;
        }
    }
}

console.log('\n' + '='.repeat(70));
console.log('📊 SETUP SUMMARY');
console.log('='.repeat(70));
console.log(`✅ Successful: ${successCount}/${steps.length}`);
if (failedSteps.length > 0) {
    console.log(`❌ Failed: ${failedSteps.join(', ')}`);
} else {
    console.log('🎉 All steps completed successfully!');
    console.log('\nYou can now start your backend server with:');
    console.log('  cd backend && npm start');
}
console.log('='.repeat(70) + '\n');
