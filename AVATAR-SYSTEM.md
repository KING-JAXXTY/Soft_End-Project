# Avatar System Documentation

## Overview
TulongAral+ uses a centralized avatar system with 22 pre-designed avatar options from Avataaars.io. All user avatars are stored as avatar IDs (avatar1-avatar22) in the database and mapped to full URLs via the frontend.

## System Architecture

### 1. Database Layer (MongoDB)
- **User Model** (`models/User.js`)
  ```javascript
  avatar: {
    type: String,
    default: 'avatar1'  // Always has a default value
  }
  ```
- **Default Value**: All users get `avatar1` if no avatar is specified
- **Storage Format**: String IDs like "avatar1", "avatar2", etc.

### 2. Backend API Layer
All routes that return user data include the avatar field:

#### Authentication Routes (`routes/auth.js`)
- **Register**: Sets avatar from form or defaults to 'avatar1'
- **Login**: Returns user avatar in response
- **Current User**: Returns avatar field

#### Profile Routes (`routes/profile.js`)
- **Get Profile**: Populates user with avatar field
- **Update Profile**: Updates avatar in User model

#### Message Routes (`routes/messages.js`)
- Populates participants with avatar field
- Populates message sender with avatar field

#### Forum Routes (`routes/forum.js`)
- Populates post author with avatar field
- Populates comment author with avatar field

#### Application Routes (`routes/applications.js`)
- Populates student with avatar field
- Populates sponsor with avatar field

#### Report Routes (`routes/reports.js`)
- Populates reporter with avatar field

### 3. Frontend Layer

#### Avatar Mapping (`js/avatars.js`)
```javascript
const AVATAR_URLS = {
    avatar1: 'https://avataaars.io/...',
    avatar2: 'https://avataaars.io/...',
    // ... 22 total avatars
};

function getAvatarUrl(avatarId) {
    return AVATAR_URLS[avatarId] || AVATAR_URLS.avatar1;  // Fallback to avatar1
}
```

#### Pages Using Avatars
1. **register.html** - Avatar selection during registration
   - Loads avatars.js
   - Dynamic avatar loading via loadAvatars()
   - Collapsible avatar section

2. **profile.html** - Avatar editing
   - Loads avatars.js
   - Dynamic avatar loading via loadAvatarsForProfile()
   - Lazy loads avatars when "Change Avatar" clicked

3. **messages.html** - Displays user avatars in conversations
   - Loads avatars.js
   - Uses getAvatarUrl() for all user avatars
   - Fallback handling for missing avatars

4. **forum.html** - Displays author avatars in posts/comments
   - Loads avatars.js
   - Uses getAvatarUrl() for post authors
   - Uses getAvatarUrl() for comment authors

5. **view-profile.html** - Displays user profile avatar
   - Loads avatars.js
   - Uses getAvatarUrl() with fallback to initials

## Avatar Fallback Strategy

### Level 1: Database Default
- User model has default: 'avatar1'
- All new users automatically get avatar1

### Level 2: Backend Fallback
- Registration: `avatar: avatar || 'avatar1'`
- Profile Update: `avatar: avatar || 'avatar1'`

### Level 3: Frontend Fallback
- `getAvatarUrl()`: Returns AVATAR_URLS.avatar1 if ID not found
- View Profile: Shows initials if no avatar URL

### Level 4: API Population
- All `.populate()` calls include 'avatar' field
- Ensures avatar is always sent to frontend

## User Avatar Flow

### New User Registration
1. User selects avatar from 22 options
2. Avatar ID stored in registration form
3. Backend creates user with selected avatar or 'avatar1'
4. Database stores avatar ID string

### User Login
1. Backend retrieves user including avatar field
2. Avatar ID sent to frontend in user object
3. Frontend stores in localStorage/sessionStorage
4. All pages access via API.getCurrentUser()

### Avatar Display
1. Frontend gets avatar ID from user object
2. Calls getAvatarUrl(avatarId)
3. Function returns full Avataaars.io URL
4. Image displayed with src=avatarUrl

### Avatar Update
1. User clicks "Change Avatar" on profile
2. Profile page lazy-loads all 22 avatars
3. User selects new avatar
4. Backend updates User.avatar field
5. Frontend updates localStorage/sessionStorage
6. UI reflects new avatar immediately

## Migration for Existing Users

Run `avatar-migration.js` to ensure all existing users have avatars:

```bash
node avatar-migration.js
```

This script:
- Finds users with missing/null/empty avatar fields
- Sets them to 'avatar1' (default)
- Verifies all users now have valid avatars
- Shows avatar statistics

## Verification Checklist

✅ **Database Layer**
- [ ] User model has avatar field with default
- [ ] All users have valid avatar values (run migration)

✅ **Backend Layer**
- [ ] Auth routes return avatar in user object
- [ ] Profile routes include avatar in populate
- [ ] Message routes include avatar in populate
- [ ] Forum routes include avatar in populate
- [ ] Application routes include avatar in populate
- [ ] All user-related routes include avatar field

✅ **Frontend Layer**
- [ ] avatars.js loaded on all pages that show avatars
- [ ] getAvatarUrl() has fallback to avatar1
- [ ] Register page dynamically loads all 22 avatars
- [ ] Profile page dynamically loads all 22 avatars
- [ ] Messages page uses getAvatarUrl()
- [ ] Forum page uses getAvatarUrl()
- [ ] View profile page uses getAvatarUrl()

✅ **User Experience**
- [ ] No users without avatars
- [ ] No broken image links
- [ ] Avatars display correctly on all pages
- [ ] Avatar selection works in register
- [ ] Avatar changing works in profile
- [ ] Fallbacks work when avatar ID invalid

## Common Issues & Solutions

### Issue: User has no avatar displayed
**Solution**: Check if avatars.js is loaded on that page

### Issue: Avatar shows as broken image
**Solution**: Verify getAvatarUrl() is being called with valid ID

### Issue: Old users have no avatars
**Solution**: Run avatar-migration.js script

### Issue: New feature shows user but no avatar
**Solution**: 
1. Ensure backend populates 'avatar' field
2. Ensure frontend loads avatars.js
3. Use getAvatarUrl(user.avatar) to get URL

## Testing

### Manual Testing
1. Register new user - should show avatar selection
2. Select avatar - should save and display
3. Login - avatar should persist
4. View profile - avatar should display
5. Edit profile - can change avatar
6. Send message - avatar shows in conversation
7. Post in forum - avatar shows on post
8. View other profiles - their avatars show

### Automated Testing
```javascript
// Check if all avatars are accessible
Object.keys(AVATAR_URLS).forEach(avatarId => {
    const url = getAvatarUrl(avatarId);
    console.assert(url && url.startsWith('https://'), `Avatar ${avatarId} has invalid URL`);
});

// Verify fallback works
const invalidUrl = getAvatarUrl('invalid-id');
console.assert(invalidUrl === AVATAR_URLS.avatar1, 'Fallback should return avatar1');
```

## Avatar List (22 Total)

1. **avatar1** - Short Blonde Hair, Beard, Black V-Neck (Default)
2. **avatar2** - Long Platinum Hair, Gray Scoop Neck
3. **avatar3** - Short Dreads, Black, Gray Hoodie
4. **avatar4** - Blue Hijab, Round Glasses, Brown Skin
5. **avatar5** - Pink Bun Hair, Prescription Glasses, Blazer
6. **avatar6** - Silver Long Hair, Gray Hoodie, Dark Brown Skin
7. **avatar7** - Red Caesar Hair, Black Beard, Blazer Sweater
8. **avatar8** - Blonde Shaved Sides, Beard, Pale Skin
9. **avatar9** - Black Fro Band, Gray Scoop Neck, Black Skin
10. **avatar10** - Brown Dreads, Blazer Shirt, Brown Skin
11. **avatar11** - No Hair, Red Majestic Beard, Collar Sweater
12. **avatar12** - Dark Brown Short Hair, Beard, Crew Neck
13. **avatar13** - Auburn Curly Hair, Glasses, Bear Graphic Shirt
14. **avatar14** - Brown Straight Hair, Kurt Glasses, Blazer
15. **avatar15** - Black Waved Hair, Sunglasses, Blue Hoodie
16. **avatar16** - Red Big Hair, Wink, Pastel Red Scoop Neck
17. **avatar17** - Gray Turban, Brown Beard, Gray V-Neck
18. **avatar18** - Pastel Blue Winter Hat, Surprised, Hoodie
19. **avatar19** - Dark Brown Curly Long Hair, Blue Overall
20. **avatar20** - Platinum Frizzle Hair, Glasses, Green Crew Neck
21. **avatar21** - Blue Hat, Black Hair, Skull Graphic Shirt
22. **avatar22** - Golden Blonde Straight Hair, Round Glasses, Yellow Sweater

## Future Enhancements

- [ ] Add more avatar options (easy - just add to AVATAR_URLS)
- [ ] Allow custom avatar uploads
- [ ] Add avatar editor/customizer
- [ ] Cache avatar URLs in service worker
- [ ] Add avatar loading placeholders
- [ ] Implement avatar CDN for faster loading
