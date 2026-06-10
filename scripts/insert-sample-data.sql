-- =====================================================
-- CancelIt Sample Data Script
-- =====================================================
-- Run this AFTER signing up for an account to populate with sample data
-- Replace 'YOUR_USER_ID_HERE' with your actual user_id from auth.users

-- First, get your user_id by running this in a separate query:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then replace the variable below:
DO $$
DECLARE
    v_user_id UUID;
    v_customer_id UUID;
    v_streaming_cat UUID;
    v_music_cat UUID;
    v_productivity_cat UUID;
    v_cloud_cat UUID;
    v_gaming_cat UUID;
    v_fitness_cat UUID;
    v_news_cat UUID;
    v_food_cat UUID;
BEGIN
    -- Get the current authenticated user (works in Supabase)
    v_user_id := auth.uid();
    
    -- If running outside of authenticated context, you can hardcode:
    -- v_user_id := 'YOUR_USER_ID_HERE'::UUID;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user_id found. Please sign in first or set v_user_id manually.';
    END IF;
    
    -- Get customer_id
    SELECT id INTO v_customer_id FROM customers WHERE user_id = v_user_id;
    
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'No customer record found. Please sign up first.';
    END IF;
    
    -- Get category IDs
    SELECT id INTO v_streaming_cat FROM subscription_categories WHERE name = 'Streaming';
    SELECT id INTO v_music_cat FROM subscription_categories WHERE name = 'Music';
    SELECT id INTO v_productivity_cat FROM subscription_categories WHERE name = 'Productivity';
    SELECT id INTO v_cloud_cat FROM subscription_categories WHERE name = 'Cloud Storage';
    SELECT id INTO v_gaming_cat FROM subscription_categories WHERE name = 'Gaming';
    SELECT id INTO v_fitness_cat FROM subscription_categories WHERE name = 'Fitness';
    SELECT id INTO v_news_cat FROM subscription_categories WHERE name = 'News';
    SELECT id INTO v_food_cat FROM subscription_categories WHERE name = 'Food';
    
    -- Insert sample subscriptions
    INSERT INTO subscriptions (user_id, customer_id, name, description, category_id, amount, billing_cycle, next_billing_date, status, payment_method) VALUES
    (v_user_id, v_customer_id, 'Netflix', 'Streaming service with movies and TV shows', v_streaming_cat, 15.99, 'monthly', CURRENT_DATE + INTERVAL '15 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Spotify', 'Music streaming premium', v_music_cat, 10.99, 'monthly', CURRENT_DATE + INTERVAL '8 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Disney+', 'Family entertainment streaming', v_streaming_cat, 7.99, 'monthly', CURRENT_DATE + INTERVAL '22 days', 'active', 'PayPal'),
    (v_user_id, v_customer_id, 'Adobe Creative Cloud', 'Design and creativity tools', v_productivity_cat, 54.99, 'monthly', CURRENT_DATE + INTERVAL '5 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Dropbox', 'Cloud storage service', v_cloud_cat, 11.99, 'monthly', CURRENT_DATE + INTERVAL '12 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'YouTube Premium', 'Ad-free videos and music', v_streaming_cat, 11.99, 'monthly', CURRENT_DATE + INTERVAL '18 days', 'active', 'Google Pay'),
    (v_user_id, v_customer_id, 'Xbox Game Pass', 'Gaming subscription service', v_gaming_cat, 14.99, 'monthly', CURRENT_DATE + INTERVAL '25 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Amazon Prime', 'Shopping and video streaming', v_streaming_cat, 139.99, 'yearly', CURRENT_DATE + INTERVAL '90 days', 'active', 'Amazon'),
    (v_user_id, v_customer_id, 'GitHub Copilot', 'AI pair programming', v_productivity_cat, 10.00, 'monthly', CURRENT_DATE + INTERVAL '10 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Notion', 'Note-taking and productivity', v_productivity_cat, 10.00, 'monthly', CURRENT_DATE + INTERVAL '7 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'ChatGPT Plus', 'AI assistant premium', v_productivity_cat, 20.00, 'monthly', CURRENT_DATE + INTERVAL '14 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Planet Fitness', 'Gym membership', v_fitness_cat, 10.00, 'monthly', CURRENT_DATE + INTERVAL '20 days', 'active', 'Bank Transfer'),
    (v_user_id, v_customer_id, 'New York Times', 'Digital news subscription', v_news_cat, 17.00, 'monthly', CURRENT_DATE + INTERVAL '3 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'HelloFresh', 'Meal kit delivery', v_food_cat, 69.99, 'weekly', CURRENT_DATE + INTERVAL '2 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'Apple Music', 'Music streaming service', v_music_cat, 10.99, 'monthly', CURRENT_DATE + INTERVAL '28 days', 'active', 'Apple Pay'),
    (v_user_id, v_customer_id, 'Hulu', 'TV shows and movies', v_streaming_cat, 7.99, 'monthly', CURRENT_DATE + INTERVAL '11 days', 'active', 'Credit Card'),
    (v_user_id, v_customer_id, 'LinkedIn Premium', 'Professional networking', v_productivity_cat, 29.99, 'monthly', CURRENT_DATE + INTERVAL '16 days', 'active', 'Credit Card');
    
    -- Insert sample alerts
    INSERT INTO subscription_alerts (user_id, subscription_id, alert_type, title, message, priority) VALUES
    (v_user_id, (SELECT id FROM subscriptions WHERE user_id = v_user_id AND name = 'Adobe Creative Cloud'), 'renewal', 'Renewal Coming Soon', 'Your Adobe Creative Cloud subscription will renew in 5 days for $54.99', 'high'),
    (v_user_id, (SELECT id FROM subscriptions WHERE user_id = v_user_id AND name = 'Planet Fitness'), 'unused', 'Unused Subscription', 'You haven''t used Planet Fitness in 30 days. Consider cancelling?', 'medium'),
    (v_user_id, (SELECT id FROM subscriptions WHERE user_id = v_user_id AND name = 'Netflix'), 'price_change', 'Price Increase', 'Netflix has announced a price increase to $17.99/month starting next billing cycle', 'medium');
    
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Customer ID: %', v_customer_id;
    RAISE NOTICE 'Total subscriptions: %', (SELECT COUNT(*) FROM subscriptions WHERE user_id = v_user_id);
END $$;
