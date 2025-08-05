#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://lontanjfuxuevvqqupsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvbnRhbmpmdXh1ZXZ2cXF1cHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTIzNzcsImV4cCI6MjA2OTkyODM3N30.watvIC_05bZChqJ-7U4m5iRe1JIZ-XyaQRQMCcOGmic';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    console.log('🗄️ Setting up Table 1837 database...');
    
    try {
        // Read the SQL setup script
        const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-cocktails-table.sql'), 'utf8');
        
        console.log('📋 SQL script loaded successfully');
        console.log('⚠️  Note: This script needs to be run in the Supabase SQL Editor');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/lontanjfuxuevvqqupsl/sql');
        console.log('📝 Copy and paste the contents of setup-cocktails-table.sql');
        
        // Test the connection
        console.log('🔍 Testing Supabase connection...');
        const { data, error } = await supabase.from('cocktails').select('count');
        
        if (error) {
            console.log('❌ Database not set up yet. Please run the SQL script first.');
            console.log('📋 SQL Script Contents:');
            console.log('='.repeat(50));
            console.log(sqlScript);
            console.log('='.repeat(50));
        } else {
            console.log('✅ Database connection successful!');
            console.log('📊 Current cocktails count:', data.length);
        }
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
    }
}

// Run the setup
setupDatabase();