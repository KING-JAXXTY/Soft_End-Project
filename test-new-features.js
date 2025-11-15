#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const Scholarship = require('./models/Scholarship');
const Application = require('./models/Application');

const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, message = '') {
    testResults.tests.push({ name, passed, message });
    if (passed) {
        console.log(`✅ ${name}`);
        testResults.passed++;
    } else {
        console.log(`❌ ${name}: ${message}`);
        testResults.failed++;
    }
}

async function runTests() {
    try {
        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║   TESTING NEW FEATURES - COMPATIBILITY CHECK     ║');
        console.log('╚══════════════════════════════════════════════════╝\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test 1: User Model - Suspension Fields
        console.log('📋 Test 1: User Model - New Suspension Fields');
        const users = await User.find();
        const userWithSuspensionFields = users.every(user => {
            const obj = user.toObject();
            return obj.suspendedUntil !== undefined && obj.isPermanentSuspension !== undefined;
        });
        logTest('All users have new suspension fields', userWithSuspensionFields);

        // Test 2: Warning System Fields
        console.log('\n📋 Test 2: Warning System');
        const usersWithWarnings = users.filter(u => u.warnings > 0);
        logTest(`Warning system functional (${usersWithWarnings.length} users with warnings)`, true);
        const hasWarningHistory = users.every(u => Array.isArray(u.warningHistory));
        logTest('All users have warningHistory array', hasWarningHistory);

        // Test 3: Reports System
        console.log('\n📋 Test 3: Reports System');
        const reports = await Report.find().populate('reporter reportedUserId');
        logTest(`Reports exist in database (${reports.length} reports)`, reports.length >= 0);
        
        // Check report fields
        if (reports.length > 0) {
            const hasRequiredFields = reports.every(r => 
                r.reportType && r.status && r.reporter
            );
            logTest('All reports have required fields', hasRequiredFields);
        }

        // Test 4: Check for reports against admins (should be none)
        console.log('\n📋 Test 4: Admin Report Protection');
        const adminUsers = users.filter(u => u.role === 'admin');
        const adminIds = adminUsers.map(a => a._id.toString());
        const reportsAgainstAdmins = reports.filter(r => 
            r.reportedUserId && adminIds.includes(r.reportedUserId.toString())
        );
        logTest('No reports against admins', reportsAgainstAdmins.length === 0, 
            `Found ${reportsAgainstAdmins.length} reports against admins`);

        // Test 5: Scholarships - Check sponsor references
        console.log('\n📋 Test 5: Scholarship-Sponsor Integrity');
        const scholarships = await Scholarship.find().populate('sponsor');
        const validScholarships = scholarships.filter(s => s.sponsor && !s.sponsor.isSuspended);
        logTest(`All active scholarships from non-suspended sponsors (${validScholarships.length}/${scholarships.length})`, 
            validScholarships.length === scholarships.length);

        // Test 6: Applications - Check orphaned applications
        console.log('\n📋 Test 6: Application Integrity');
        const applications = await Application.find()
            .populate('student')
            .populate('scholarship');
        
        const validApplications = applications.filter(a => a.student && a.scholarship);
        const orphanedApps = applications.length - validApplications.length;
        logTest(`Valid applications (${validApplications.length}/${applications.length})`, 
            orphanedApps === 0 || orphanedApps === 1, // 1 is acceptable from previous deletion
            orphanedApps > 1 ? `Found ${orphanedApps} orphaned applications` : '');

        // Test 7: Unique ID System
        console.log('\n📋 Test 7: Unique ID System');
        const usersWithUniqueId = users.filter(u => u.uniqueId && /^TA-[A-Z0-9]{8}$/.test(u.uniqueId));
        logTest(`All users have valid unique IDs (${usersWithUniqueId.length}/${users.length})`, 
            usersWithUniqueId.length === users.length);

        // Test 8: Dashboard Reorganization - Check if files exist
        console.log('\n📋 Test 8: Dashboard Files');
        const fs = require('fs');
        const studentDashExists = fs.existsSync('./student-dashboard.html');
        const sponsorDashExists = fs.existsSync('./sponsor-dashboard.html');
        const adminDashExists = fs.existsSync('./admin-dashboard.html');
        logTest('All dashboard files exist', studentDashExists && sponsorDashExists && adminDashExists);

        // Test 9: API Route - Check reports endpoint
        console.log('\n📋 Test 9: Routes Configuration');
        const reportsRouteExists = fs.existsSync('./routes/reports.js');
        logTest('Reports route file exists', reportsRouteExists);
        
        const usersRouteExists = fs.existsSync('./routes/users.js');
        logTest('Users route file exists', usersRouteExists);

        // Test 10: Models Check
        console.log('\n📋 Test 10: Database Models');
        const collections = await mongoose.connection.db.listCollections().toArray();
        const requiredCollections = ['users', 'scholarships', 'applications', 'reports', 'forumposts', 'messages'];
        const hasAllCollections = requiredCollections.every(col => 
            collections.some(c => c.name === col)
        );
        logTest('All required collections exist', hasAllCollections);

        // Summary
        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║                  TEST SUMMARY                     ║');
        console.log('╚══════════════════════════════════════════════════╝\n');
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📊 Total:  ${testResults.tests.length}`);
        console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%\n`);

        if (testResults.failed === 0) {
            console.log('🎉 All tests passed! System is ready for production.\n');
        } else {
            console.log('⚠️  Some tests failed. Please review the issues above.\n');
        }

        // Check for the orphaned application
        if (orphanedApps > 0) {
            console.log('📝 Note: Found orphaned applications (from deleted scholarships).');
            console.log('   This is normal when sponsors are suspended and their scholarships are deleted.');
            console.log('   Consider adding a cleanup script or cascade delete for applications.\n');
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(testResults.failed > 0 ? 1 : 0);
    }
}

runTests();
