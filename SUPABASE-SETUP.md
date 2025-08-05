# 🗄️ Supabase Setup for Table 1837 Bar Management

## 📋 Current Status

The system is currently configured with placeholder Supabase credentials. To properly connect to your database, you need to set up a Supabase project.

## 🔧 Setup Options

### Option 1: Create a New Supabase Project (Recommended)

1. **Go to [Supabase](https://supabase.com)** and create a new project
2. **Get your project URL and anon key** from the project settings
3. **Create the cocktails table** with the following schema:

```sql
CREATE TABLE cocktails (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ingredients TEXT[] NOT NULL,
    recipe TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'classic',
    difficulty VARCHAR(50) DEFAULT 'medium',
    prep_time INTEGER DEFAULT 5,
    glass_type VARCHAR(100) DEFAULT 'rocks',
    garnish VARCHAR(255) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON cocktails
    FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage cocktails" ON cocktails
    FOR ALL USING (auth.role() = 'authenticated');
```

### Option 2: Use Environment Variables

If you have existing Supabase credentials, set these environment variables:

```bash
# For development
export SUPABASE_URL="your-supabase-project-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# For production (Netlify)
# Add these in your Netlify environment variables
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Option 3: Direct Database Connection (Advanced)

The connection strings you provided are for a Neon PostgreSQL database. If you want to use this directly instead of Supabase:

1. **Install PostgreSQL client:**
   ```bash
   npm install pg
   ```

2. **Create a direct database service** (separate from Supabase)
3. **Update the cocktails module** to use the direct database connection

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
- Visit [supabase.com](https://supabase.com)
- Create new project
- Note your project URL and anon key

### 2. Update Configuration
Replace the placeholder values in `src/js/services/supabaseService.js`:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Create Database Table
Run this SQL in your Supabase SQL editor:

```sql
-- Create cocktails table
CREATE TABLE cocktails (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ingredients TEXT[] NOT NULL,
    recipe TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'classic',
    difficulty VARCHAR(50) DEFAULT 'medium',
    prep_time INTEGER DEFAULT 5,
    glass_type VARCHAR(100) DEFAULT 'rocks',
    garnish VARCHAR(255) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON cocktails
    FOR SELECT USING (true);

-- Allow authenticated users to manage data
CREATE POLICY "Allow authenticated users to manage cocktails" ON cocktails
    FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Test Connection
The system will automatically test the connection when the cocktails tab is loaded.

## 📊 Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Cocktail name |
| ingredients | TEXT[] | Array of ingredients |
| recipe | TEXT | Preparation instructions |
| category | VARCHAR(100) | Category (classic, modern, refreshing, etc.) |
| difficulty | VARCHAR(50) | Difficulty level (easy, medium, hard) |
| prep_time | INTEGER | Preparation time in minutes |
| glass_type | VARCHAR(100) | Type of glass |
| garnish | VARCHAR(255) | Garnish description |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |

## 🔒 Security

- **Row Level Security (RLS)** is enabled
- **Public read access** for viewing cocktails
- **Authenticated users** can create, update, delete
- **Fallback data** available when database is unavailable

## 🧪 Testing

1. **Load the application**
2. **Navigate to the Cocktails tab**
3. **Check browser console** for connection status
4. **Try adding a test cocktail** to verify CRUD operations

## 🚨 Troubleshooting

### Connection Issues
- Verify Supabase URL and key are correct
- Check if the cocktails table exists
- Ensure RLS policies are configured properly

### Build Issues
- Make sure @supabase/supabase-js is installed
- Check for any import/export issues

### Real-time Issues
- Verify real-time is enabled in Supabase
- Check browser console for subscription errors

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Test the connection using the Supabase dashboard
4. Check the network tab for failed requests

---

**Next Steps:** Once you have your Supabase credentials, update the service configuration and the system will automatically connect to your database! 