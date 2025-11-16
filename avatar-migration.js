/**
 * Avatar Migration Script
 * Ensures all users in the database have a valid avatar field set
 * Run this once to fix any existing users without avatars
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tulongAral');
        console.log('✓ MongoDB Connected for avatar migration');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema (minimal version for migration)
const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    role: String,
    avatar: {
        type: String,
        default: 'avatar1'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Run migration
const migrateAvatars = async () => {
    try {
        console.log('\n🔍 Checking for users without avatars...\n');

        // Find users without avatar field or with null/empty avatar
        const usersWithoutAvatar = await User.find({
            $or: [
                { avatar: { $exists: false } },
                { avatar: null },
                { avatar: '' }
            ]
        });

        console.log(`Found ${usersWithoutAvatar.length} users without valid avatars`);

        if (usersWithoutAvatar.length === 0) {
            console.log('\n✓ All users already have valid avatars!');
            return;
        }

        // Update each user with default avatar
        let updatedCount = 0;
        for (const user of usersWithoutAvatar) {
            user.avatar = 'avatar1'; // Set default avatar
            await user.save();
            updatedCount++;
            console.log(`✓ Updated user: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
        }

        console.log(`\n✓ Successfully updated ${updatedCount} users with default avatars`);
        
        // Verify all users now have avatars
        const stillMissing = await User.countDocuments({
            $or: [
                { avatar: { $exists: false } },
                { avatar: null },
                { avatar: '' }
            ]
        });

        if (stillMissing === 0) {
            console.log('✓ Verification passed: All users now have valid avatars\n');
        } else {
            console.log(`⚠ Warning: ${stillMissing} users still missing avatars\n`);
        }

    } catch (error) {
        console.error('✗ Migration error:', error);
    }
};

// Show current avatar statistics
const showAvatarStats = async () => {
    try {
        console.log('\n📊 Avatar Statistics:\n');
        
        const totalUsers = await User.countDocuments();
        console.log(`Total users: ${totalUsers}`);
        
        // Count users by avatar
        const avatarCounts = await User.aggregate([
            { $group: { _id: '$avatar', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        console.log('\nAvatar distribution:');
        avatarCounts.forEach(({ _id, count }) => {
            console.log(`  ${_id || '(empty)'}: ${count} users`);
        });
        
        // Count by role
        console.log('\nUsers by role:');
        const roleCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        roleCounts.forEach(({ _id, count }) => {
            console.log(`  ${_id}: ${count} users`);
        });
        
        console.log('');
    } catch (error) {
        console.error('✗ Stats error:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    
    console.log('='.repeat(60));
    console.log('TULONGARAL+ AVATAR MIGRATION SCRIPT');
    console.log('='.repeat(60));
    
    // Show current stats
    await showAvatarStats();
    
    // Run migration
    await migrateAvatars();
    
    // Show updated stats
    await showAvatarStats();
    
    console.log('='.repeat(60));
    console.log('Migration completed!');
    console.log('='.repeat(60));
    
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed\n');
    process.exit(0);
};

// Run the script
main();
