# GitHub Copilot Instructions for TulongAral+ Project

## General Coding Rules

### Code Style
- Do NOT use emojis in code, comments, or button text
- Use clear, descriptive variable and function names
- Follow consistent indentation (2 or 4 spaces)
- Add comments for complex logic
- Do not use cringe wording or slang in code comments or UI text
- Use consistent ui design patterns
- Check for any potential duplications before adding new code
- Always handle errors gracefully
- If you think that its okay to commit changes, you can go ahead
- Remove any emojis you see in the code or comments 
- dont use cartonist ui design patterns
- can we take inspiration to the apple and huawei ui design patterns, without us copying them directly
- always prioritize user experience and accessibility
- Always use media queries for responsive design with proper breakpoints and test on multiple device sizes and orientations
- make sure we follow the shcolarship platform theme and color scheme and avoid using colors that clash with the overall design and branding of the platform
- Dont ever use vibecoding ui design patterns
- when changing something that already exists, make sure to check the whole codebase for any references to the changed part to avoid breaking functionality 

### Project Structure
- Frontend: HTML, CSS, JavaScript (Vanilla JS, no frameworks)
- Backend: Node.js with Express
- Database: MongoDB with Mongoose
- Authentication: JWT tokens

### User Roles
1. **Student** - Can apply for scholarships, participate in forums, use messaging
2. **Sponsor** - Can create scholarships, review applications, use messaging
3. **Admin** - Platform management, user oversight (cannot delete own account)

## Feature-Specific Rules

### Profile Management
- Students and Sponsors can delete their accounts
- Admins cannot delete their own accounts
- Profile deletion requires double confirmation
- All related data must be cleaned up (applications, posts, messages, etc.)

### Community Forum
- Show user profiles in modal, not by navigation
- Grammar checker available for post title and content
- Users can edit/delete their own posts
- Admins can delete any post

### Gemini AI Integration
- Use grammar checking for posts and scholarship descriptions
- No emojis in AI-generated content
- Always handle API errors gracefully
- Use round-robin with multiple API keys

### UI/UX Guidelines
- Mobile-first responsive design
- Clear error and success messages
- Confirmation dialogs for destructive actions
- Loading states for async operations

## Security Rules
- Always validate user authentication
- Check user roles before allowing actions
- Sanitize user inputs
- Use JWT tokens stored in localStorage
- Never expose API keys in frontend code (except Gemini which is restricted)

## Database Operations
- Use proper Mongoose models
- Always handle errors with try-catch
- Clean up related data on deletions
- Use population for related documents

## Git Commit Rules
- Use clear, descriptive commit messages
- Format: "Action: Description of what was changed"
- Examples:
  - "Fix: Community forum user profile viewing bug"
  - "Add: Gemini AI grammar checker to forum posts"
  - "Improve: UX with modal for user profiles"

## Testing & Deployment
- Test on localhost before committing
- Check for console errors
- Verify mobile responsiveness
- Ensure all API endpoints work correctly

## Additional Notes
- This is a scholarship platform for Filipino students
- Support for multiple regions and institutions
- Focus on accessibility and ease of use
- Keep the interface clean and professional
