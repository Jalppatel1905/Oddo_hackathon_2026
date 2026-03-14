# Gmail OTP Setup Guide

## 📧 How to Enable Real Gmail OTP Emails

Follow these steps to send OTP emails from your real Gmail account:

---

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "Signing in to Google", enable **2-Step Verification**
4. Follow the setup wizard (you'll need your phone)

---

## Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Under "Signing in to Google", click **App passwords**
3. You might need to sign in again
4. In the "Select app" dropdown, choose **Mail**
5. In the "Select device" dropdown, choose **Other (Custom name)**
6. Enter: **CoreInventory**
7. Click **Generate**
8. **IMPORTANT**: Copy the 16-character password shown (format: `xxxx xxxx xxxx xxxx`)
9. Save it - you won't see it again!

---

## Step 3: Update Your .env File

Open `.env` file in your project and update:

```env
# Email Configuration (Gmail)
EMAIL_USER="your-actual-email@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"
```

### Example:
```env
EMAIL_USER="saurav.inventory@gmail.com"
EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

**Note:** Remove spaces from app password or keep them - both work!

---

## Step 4: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 5: Test OTP Email

1. Go to: http://localhost:3000/login
2. Click **"Forgot password?"**
3. Enter your email address (the one you registered with)
4. Click **"Send OTP"**
5. Check your Gmail inbox for the OTP email
6. OTP will also be logged to console as backup

---

## 📧 Email Template Preview

You'll receive a professional email like this:

```
Subject: CoreInventory - Password Reset OTP

Password Reset Request

You requested to reset your password for CoreInventory.

Your OTP for password reset is:

  123456

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.
```

---

## 🔧 Troubleshooting

### "Invalid login credentials" error?
- Make sure you're using the **App Password**, not your regular Gmail password
- App password should be 16 characters (with or without spaces)
- Double-check you copied the entire password

### "Less secure apps" error?
- You don't need to enable "Less secure apps" anymore
- App Passwords are the modern, secure way

### Email not arriving?
1. Check spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Check console logs for errors
4. OTP is always logged to console as backup

### Port 587 blocked?
Try changing the transporter config in `forgot-password/route.ts`:

```typescript
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## 🔐 Security Notes

1. **Never commit .env to git** - it's already in .gitignore
2. App password can only access email, not your full account
3. You can revoke app passwords anytime from Google Account settings
4. Each app should have its own app password
5. OTP expires in 10 minutes automatically

---

## 📱 Alternative: Using Other Email Services

### Outlook/Hotmail:
```typescript
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Custom SMTP:
```typescript
const transporter = nodemailer.createTransport({
  host: "smtp.yourdomain.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## ✅ Quick Checklist

- [ ] 2FA enabled on Gmail
- [ ] App password generated
- [ ] .env file updated with EMAIL_USER
- [ ] .env file updated with EMAIL_PASSWORD
- [ ] Server restarted
- [ ] Test email sent successfully
- [ ] OTP received in inbox

---

## 🎯 Current Setup

Your current configuration:
- **Development mode**: OTP logged to console always (backup)
- **Production mode**: Sends real email if EMAIL_USER and EMAIL_PASSWORD are set
- **Fallback**: If email fails, OTP still logged to console

This dual approach ensures OTP reset always works, even if email fails!

---

**Need help?** The OTP will always appear in your terminal/console, so you can still test password reset even without email setup! 🚀
