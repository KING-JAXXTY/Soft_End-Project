/**
 * Avatar System Verification Test
 * Run this to verify the entire avatar system is working correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tulongAral');
        console.log('✓ MongoDB Connected');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    role: String,
    avatar: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Available avatars (should match avatars.js)
const AVAILABLE_AVATARS = [
    'avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6',
    'avatar7', 'avatar8', 'avatar9', 'avatar10', 'avatar11', 'avatar12',
    'avatar13', 'avatar14', 'avatar15', 'avatar16', 'avatar17', 'avatar18',
    'avatar19', 'avatar20', 'avatar21', 'avatar22'
];

// Test Results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, condition) {
    totalTests++;
    if (condition) {
        console.log(`  ✓ ${description}`);
        passedTests++;
        return true;
    } else {
        console.log(`  ✗ ${description}`);
        failedTests++;
        return false;
    }
}

// Run all tests
const runTests = async () => {
    console.log('\n' + '='.repeat(70));
    console.log('AVATAR SYSTEM VERIFICATION TEST');
    console.log('='.repeat(70) + '\n');

    // TEST 1: Database Schema
    console.log('TEST 1: Database Schema');
    console.log('-'.repeat(70));
    try {
        const userSchemaObj = User.schema.obj;
        test('User model has avatar field', userSchemaObj.hasOwnProperty('avatar') || User.schema.path('avatar'));
        
        const avatarPath = User.schema.path('avatar');
        if (avatarPath) {
            test('Avatar field is of type String', avatarPath.instance === 'String');
            test('Avatar field has default value', avatarPath.defaultValue !== undefined);
        }
    } catch (error) {
        test('Database schema test passed', false);
        console.log('    Error:', error.message);
    }

    // TEST 2: User Data Integrity
    console.log('\nTEST 2: User Data Integrity');
    console.log('-'.repeat(70));
    try {
        const totalUsers = await User.countDocuments();
        test(`Found ${totalUsers} users in database`, totalUsers > 0);

        const usersWithoutAvatar = await User.countDocuments({
            $or: [
                { avatar: { $exists: false } },
                { avatar: null },
                { avatar: '' }
            ]
        });
        test('All users have avatar field set', usersWithoutAvatar === 0);

        const usersWithInvalidAvatar = await User.countDocuments({
            avatar: { $nin: AVAILABLE_AVATARS }
        });
        test('All users have valid avatar values', usersWithInvalidAvatar === 0);

        if (usersWithInvalidAvatar > 0) {
            const invalidUsers = await User.find({
                avatar: { $nin: AVAILABLE_AVATARS }
            }).select('firstName lastName email avatar');
            console.log('    Invalid avatars found:');
            invalidUsers.forEach(user => {
                console.log(`      - ${user.firstName} ${user.lastName} (${user.email}): ${user.avatar}`);
            });
        }
    } catch (error) {
        test('User data integrity test passed', false);
        console.log('    Error:', error.message);
    }

    // TEST 3: Avatar Distribution
    console.log('\nTEST 3: Avatar Distribution');
    console.log('-'.repeat(70));
    try {
        const avatarCounts = await User.aggregate([
            { $group: { _id: '$avatar', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const usedAvatars = avatarCounts.map(a => a._id);
        const unusedAvatars = AVAILABLE_AVATARS.filter(a => !usedAvatars.includes(a));

        test(`${usedAvatars.length} different avatars are in use`, usedAvatars.length > 0);
        
        console.log('\n    Avatar usage:');
        avatarCounts.forEach(({ _id, count }) => {
            console.log(`      ${_id}: ${count} user${count > 1 ? 's' : ''}`);
        });

        if (unusedAvatars.length > 0) {
            console.log(`\n    Unused avatars (${unusedAvatars.length}): ${unusedAvatars.join(', ')}`);
        }
    } catch (error) {
        test('Avatar distribution test passed', false);
        console.log('    Error:', error.message);
    }

    // TEST 4: Role-based Distribution
    console.log('\nTEST 4: Role-based Avatar Distribution');
    console.log('-'.repeat(70));
    try {
        const roles = ['student', 'sponsor', 'admin'];
        
        for (const role of roles) {
            const count = await User.countDocuments({ role });
            const withAvatar = await User.countDocuments({ 
                role,
                avatar: { $exists: true, $ne: null, $ne: '' }
            });
            test(`All ${role}s have avatars (${withAvatar}/${count})`, count === withAvatar);
        }
    } catch (error) {
        test('Role-based distribution test passed', false);
        console.log('    Error:', error.message);
    }

    // TEST 5: Avatar URL Mapping (Frontend Simulation)
    console.log('\nTEST 5: Avatar URL Mapping');
    console.log('-'.repeat(70));
    try {
        const fs = require('fs');
        const avatarsJsContent = fs.readFileSync('./js/avatars.js', 'utf8');
        
        test('avatars.js file exists', true);
        test('avatars.js contains AVATAR_URLS', avatarsJsContent.includes('AVATAR_URLS'));
        test('avatars.js contains getAvatarUrl function', avatarsJsContent.includes('function getAvatarUrl'));
        
        // Check if all 22 avatars are defined
        let definedAvatars = 0;
        for (let i = 1; i <= 22; i++) {
            if (avatarsJsContent.includes(`avatar${i}:`)) {
                definedAvatars++;
            }
        }
        test(`All 22 avatars are defined in AVATAR_URLS (found ${definedAvatars})`, definedAvatars === 22);
        
        // Check for fallback
        test('getAvatarUrl has fallback to avatar1', 
            avatarsJsContent.includes('AVATAR_URLS.avatar1') || 
            avatarsJsContent.includes("AVATAR_URLS['avatar1']"));
    } catch (error) {
        test('Avatar URL mapping test passed', false);
        console.log('    Error:', error.message);
    }

    // TEST 6: Frontend Integration
    console.log('\nTEST 6: Frontend Integration');
    console.log('-'.repeat(70));
    try {
        const fs = require('fs');
        const path = require('path');
        
        const pagesWithAvatars = [
            'register.html',
            'profile.html',
            'messages.html',
            'forum.html',
            'view-profile.html'
        ];
        
        for (const page of pagesWithAvatars) {
            const content = fs.readFileSync(`./${page}`, 'utf8');
            test(`${page} loads avatars.js`, content.includes('avatars.js'));
        }
    } catch (error) {
        test('Frontend integration test passed', false);
        console.log('    Error:', error.message);
    }

    // TEST 7: Backend Routes
    console.log('\nTEST 7: Backend Routes Avatar Population');
    console.log('-'.repeat(70));
    try {
        const fs = require('fs');
        
        const routesToCheck = {
            'routes/auth.js': ['avatar'],
            'routes/profile.js': ['avatar'],
            'routes/messages.js': ['avatar'],
            'routes/forum.js': ['avatar'],
            'routes/applications.js': ['avatar']
        };
        
        for (const [route, keywords] of Object.entries(routesToCheck)) {
            const content = fs.readFileSync(`./${route}`, 'utf8');
            for (const keyword of keywords) {
                test(`${route} includes "${keyword}" in populate/select`, 
                    content.includes(`'${keyword}'`) || content.includes(`"${keyword}"`));
            }
        }
    } catch (error) {
        test('Backend routes test passed', false);
        console.log('    Error:', error.message);
    }

    // SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
    
    if (failedTests === 0) {
        console.log('\n✓✓✓ ALL TESTS PASSED! Avatar system is fully functional. ✓✓✓\n');
    } else {
        console.log(`\n⚠ ${failedTests} test(s) failed. Please review the issues above.\n`);
    }
    console.log('='.repeat(70) + '\n');
};

// Main execution
const main = async () => {
    await connectDB();
    await runTests();
    await mongoose.connection.close();
    console.log('✓ Database connection closed\n');
    process.exit(failedTests > 0 ? 1 : 0);
};

// Run the script
main();
