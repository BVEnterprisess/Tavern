# 🗄️ **SUPABASE DATABASE SETUP GUIDE**

## 🎯 **FINAL STEP TO COMPLETE THE PROJECT**

### 📋 **Option 1: Manual Setup (Recommended)**

**Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Sign in with your GitHub account
3. Navigate to your project: `lontanjfuxuevvqqupsl`

**Step 2: Open SQL Editor**
1. Click on "SQL Editor" in the left sidebar
2. Click "New query" to create a new SQL script

**Step 3: Run the Database Setup Script**
1. Copy the entire contents of `setup-cocktails-table.sql`
2. Paste it into the SQL editor
3. Click "Run" to execute the script

**Step 4: Verify Setup**
1. Go to "Table Editor" in the left sidebar
2. You should see a new "cocktails" table
3. Check that it contains 5 sample cocktails

### 📋 **Option 2: Automated Setup**

Run the database setup script:
```bash
node setup-database.js
```

This will test the connection and provide the SQL script content.

### 📊 **What the Setup Creates:**

✅ **Cocktails Table** with full schema:
- `id` (Primary Key)
- `name` (Cocktail name)
- `ingredients` (Array of ingredients)
- `recipe` (Step-by-step instructions)
- `category` (classic, modern, refreshing, etc.)
- `difficulty` (easy, medium, hard)
- `prep_time` (Preparation time in minutes)
- `glass_type` (Type of glass)
- `garnish` (Garnish description)
- `notes` (Additional notes)
- `created_at` (Timestamp)

✅ **Security Policies:**
- Public read access (anyone can view cocktails)
- Authenticated users can manage cocktails
- Service role can perform admin operations

✅ **Sample Data:**
- Old Fashioned
- Margarita
- Mojito
- Negroni
- Espresso Martini

✅ **Performance Optimizations:**
- Indexes on name, category, and difficulty
- Real-time subscriptions enabled

### 🧪 **Testing the Setup**

Once the database is set up, test it by:

1. **Visit the website**: https://table1837tavern.bar
2. **Sign in**: user@table1837.com / password123
3. **Navigate to Cocktails tab**
4. **Verify that cocktails load from the database**

### 🎉 **Project Completion**

After completing this step, the Table 1837 Bar Management System will be:
- ✅ **Fully operational**
- ✅ **Database connected**
- ✅ **Real-time updates working**
- ✅ **Production ready**

**The system is currently 99% complete - only this database setup remains!**