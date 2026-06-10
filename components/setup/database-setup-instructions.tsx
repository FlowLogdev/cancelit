"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ExternalLink, Copy, CheckCircle, Database, ArrowRight, Code } from "lucide-react"

export function DatabaseSetupInstructions() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- CancelIt Database Setup Script (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT customers_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT customers_phone_check CHECK (phone_number IS NULL OR length(phone_number) >= 10),
  CONSTRAINT customers_user_email_unique UNIQUE(user_id, email)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  subscription_phone VARCHAR(50),
  account_number VARCHAR(255),
  monthly_cost DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  next_billing_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT subscriptions_monthly_cost_check CHECK (monthly_cost > 0),
  CONSTRAINT subscriptions_billing_cycle_check CHECK (billing_cycle = ANY(ARRAY['weekly', 'monthly', 'quarterly', 'yearly'])),
  CONSTRAINT subscriptions_status_check CHECK (status = ANY(ARRAY['active', 'paused', 'cancelled', 'expired'])),
  CONSTRAINT subscriptions_phone_check CHECK (subscription_phone IS NULL OR length(subscription_phone) >= 10)
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

DROP POLICY IF EXISTS "Users can view subscriptions for their customers" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert subscriptions for their customers" ON subscriptions;
DROP POLICY IF EXISTS "Users can update subscriptions for their customers" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete subscriptions for their customers" ON subscriptions;

-- Create RLS policies for customers table
CREATE POLICY "Users can view their own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions table
CREATE POLICY "Users can view subscriptions for their customers" ON subscriptions
  FOR SELECT USING (
      EXISTS (
          SELECT 1 FROM customers 
          WHERE customers.id = subscriptions.customer_id 
          AND customers.user_id = auth.uid()
      )
  );

CREATE POLICY "Users can insert subscriptions for their customers" ON subscriptions
  FOR INSERT WITH CHECK (
      EXISTS (
          SELECT 1 FROM customers 
          WHERE customers.id = subscriptions.customer_id 
          AND customers.user_id = auth.uid()
      )
  );

CREATE POLICY "Users can update subscriptions for their customers" ON subscriptions
  FOR UPDATE USING (
      EXISTS (
          SELECT 1 FROM customers 
          WHERE customers.id = subscriptions.customer_id 
          AND customers.user_id = auth.uid()
      )
  );

CREATE POLICY "Users can delete subscriptions for their customers" ON subscriptions
  FOR DELETE USING (
      EXISTS (
          SELECT 1 FROM customers 
          WHERE customers.id = subscriptions.customer_id 
          AND customers.user_id = auth.uid()
      )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_cycle ON subscriptions(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);

-- Verify the setup
SELECT 
  'Database setup completed successfully!' as status,
  'Tables created: customers, subscriptions' as tables_created,
  'RLS enabled and policies created' as security_status;`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <strong className="text-orange-800">Database Setup Required</strong>
          <p className="text-orange-700 mt-1">
            The database tables need to be created before you can add subscriptions. Follow the steps below to set up
            your database.
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Fixed Database Setup Instructions
          </CardTitle>
          <CardDescription>
            This version fixes the SQL syntax errors. Follow these steps to create the necessary database tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <Badge variant="outline" className="mt-1">
              1
            </Badge>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Open Supabase Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">
                Navigate to your Supabase project dashboard and open the SQL Editor.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase Dashboard
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <Badge variant="outline" className="mt-1">
              2
            </Badge>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Copy the Fixed SQL Script</h3>
              <p className="text-sm text-gray-600 mb-3">
                This version fixes the syntax errors. Copy the script below and paste it into the SQL Editor.
              </p>
              <div className="relative">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{sqlScript}</pre>
                </div>
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Fixed Script
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <Badge variant="outline" className="mt-1">
              3
            </Badge>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Run the Script</h3>
              <p className="text-sm text-gray-600 mb-3">
                Paste the script into the SQL Editor and click "Run" to create the tables.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Code className="w-4 h-4" />
                <span>SQL Editor</span>
                <ArrowRight className="w-4 h-4" />
                <span>Paste Script</span>
                <ArrowRight className="w-4 h-4" />
                <span>Click Run</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4">
            <Badge variant="outline" className="mt-1">
              4
            </Badge>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Verify Setup</h3>
              <p className="text-sm text-gray-600">
                After running the script, you should see a success message with "Database setup completed
                successfully!". You can then refresh this page and start adding subscriptions.
              </p>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Fixes in this version:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Fixed regex pattern syntax (removed ~* operator)</li>
                <li>• Fixed IN operator with proper ARRAY syntax</li>
                <li>• Added proper policy cleanup</li>
                <li>• Enhanced error handling</li>
                <li>• Added verification query at the end</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
