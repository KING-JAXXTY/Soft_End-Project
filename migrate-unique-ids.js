require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrateUniqueIds() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({
        $or: [
            { uniqueId: null },
            { uniqueId: { $exists: false } }
        ]
    });
    
    console.log(`Found ${users.length} users without uniqueId`);
    
    for (const user of users) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'TA-';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        user.uniqueId = id;
        await user.save();
        console.log(`✅ Generated ID for ${user.email}: ${user.uniqueId}`);
    }
    
    console.log('Migration complete!');
    process.exit(0);
}

migrateUniqueIds().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
