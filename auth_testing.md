# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('artha_db');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@bmsit.in',
  name: 'Test Student',
  picture: 'https://via.placeholder.com/150',
  role: 'student',
  verified: true,
  college: 'bmsit',
  blocked: false,
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
API_URL="https://c0bc4aab-89ef-4bc7-a14d-c6e195c06e6e.preview.emergentagent.com"

# Test auth endpoint
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test vendors list
curl -X GET "$API_URL/api/vendors" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing
```python
# Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "c0bc4aab-89ef-4bc7-a14d-c6e195c06e6e.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://c0bc4aab-89ef-4bc7-a14d-c6e195c06e6e.preview.emergentagent.com")
```

## Admin Test Credentials
- Email: admin@artha.com
- Password: admin123

## Vendor Test Credentials
- Email: thebrewroom@vendor.artha.com
- Password: vendor123
