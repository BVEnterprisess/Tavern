-- 🍸 Cocktails Table Setup for Table 1837 Bar Management
-- Run this in your Supabase SQL Editor

-- Create cocktails table
CREATE TABLE IF NOT EXISTS cocktails (
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

-- Create policy for public read access (anyone can view cocktails)
CREATE POLICY "Allow public read access" ON cocktails
    FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage cocktails" ON cocktails
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for service role to manage cocktails (for admin operations)
CREATE POLICY "Allow service role to manage cocktails" ON cocktails
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample cocktails for testing
INSERT INTO cocktails (name, ingredients, recipe, category, difficulty, prep_time, glass_type, garnish, notes) VALUES
(
    'Old Fashioned',
    ARRAY['2 oz Bourbon or Rye Whiskey', '1/2 oz Simple Syrup', '2 dashes Angostura Bitters', 'Orange peel for garnish'],
    'Combine whiskey, simple syrup, and bitters in a mixing glass with ice. Stir until well-chilled. Strain into a rocks glass over a large ice cube. Express the oil from an orange peel over the drink and drop it in.',
    'classic',
    'easy',
    5,
    'rocks',
    'Orange peel',
    'A timeless classic that showcases the whiskey'
),
(
    'Margarita',
    ARRAY['2 oz Tequila (Blanco or Reposado)', '1 oz Fresh Lime Juice', '3/4 oz Orange Liqueur (Cointreau or Triple Sec)', 'Salt for rim (optional)', 'Lime wedge for garnish'],
    'If desired, salt the rim of a chilled margarita glass. Combine tequila, lime juice, and orange liqueur in a shaker with ice. Shake well until thoroughly chilled. Strain into the prepared glass. Garnish with a lime wedge.',
    'classic',
    'medium',
    4,
    'margarita',
    'Lime wedge',
    'Perfect balance of sweet, sour, and tequila'
),
(
    'Mojito',
    ARRAY['2 oz White Rum', '1 oz Fresh Lime Juice', '2 tsp Granulated Sugar', '6-8 Fresh Mint Leaves', 'Soda Water', 'Mint sprig and lime wedge for garnish'],
    'In a sturdy glass, gently muddle the mint leaves with lime juice and sugar. Add rum and fill the glass with crushed ice. Top with soda water and stir gently. Garnish with a mint sprig and lime wedge.',
    'refreshing',
    'medium',
    6,
    'collins',
    'Mint sprig, lime wedge',
    'Refreshing and perfect for warm weather'
),
(
    'Negroni',
    ARRAY['1 oz Gin', '1 oz Campari', '1 oz Sweet Vermouth', 'Orange slice for garnish'],
    'Combine gin, Campari, and sweet vermouth in a mixing glass with ice. Stir until well-chilled. Strain into a rocks glass over a large ice cube. Garnish with an orange slice.',
    'classic',
    'easy',
    3,
    'rocks',
    'Orange slice',
    'Bitter, complex, and sophisticated'
),
(
    'Espresso Martini',
    ARRAY['1.5 oz Vodka', '1 oz Coffee Liqueur', '1 oz Freshly Brewed Espresso (chilled)', '0.5 oz Simple Syrup (optional, to taste)', 'Coffee beans for garnish'],
    'Combine vodka, coffee liqueur, espresso, and simple syrup (if using) in a shaker with ice. Shake vigorously until well-chilled and a frothy layer forms. Double strain into a chilled coupe or martini glass. Garnish with three coffee beans.',
    'modern',
    'hard',
    8,
    'coupe',
    'Coffee beans',
    'Perfect after-dinner cocktail with a caffeine kick'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cocktails_name ON cocktails(name);
CREATE INDEX IF NOT EXISTS idx_cocktails_category ON cocktails(category);
CREATE INDEX IF NOT EXISTS idx_cocktails_difficulty ON cocktails(difficulty);

-- Enable real-time for the cocktails table
ALTER PUBLICATION supabase_realtime ADD TABLE cocktails;

-- Verify the setup
SELECT 
    'Cocktails table created successfully!' as status,
    COUNT(*) as total_cocktails
FROM cocktails; 