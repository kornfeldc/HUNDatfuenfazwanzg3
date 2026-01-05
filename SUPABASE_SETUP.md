### Supabase Setup & RLS Guide

This guide explains how to set up Supabase to work with the new Google login and how to enable Row Level Security (RLS) to protect your data.

#### 1. Authentication Setup
1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication -> Providers**.
3.  Enable **Google**.
4.  You will need to provide a **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
    *   Set the **Authorized redirect URIs** in Google Cloud Console to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (you can find this in the Supabase Google provider settings).

#### 2. Database Schema
Ensure you have a `users` table in the `public` schema. **Note:** If you followed the previous guide and created a table named `user` (singular), please rename it to `users` (plural) to avoid conflicts with reserved keywords.

```sql
-- 1. Rename the table if you created it as "user"
ALTER TABLE IF EXISTS public."user" RENAME TO users;
```