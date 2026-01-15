-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  message_body TEXT NOT NULL,
  urgency_score INTEGER NOT NULL,
  urgency_level VARCHAR(20) NOT NULL,
  urgency_reason TEXT,
  status VARCHAR(20) DEFAULT 'UNREAD',
  assigned_to VARCHAR(100),
  response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  user_id INTEGER PRIMARY KEY,
  account_status VARCHAR(50) DEFAULT 'ACTIVE',
  loan_status VARCHAR(50),
  total_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create canned_responses table
CREATE TABLE IF NOT EXISTS canned_responses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  message_text TEXT,
  category VARCHAR(100),
  usage_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_search
ON messages USING gin(to_tsvector('english', message_body));

CREATE INDEX IF NOT EXISTS idx_messages_urgency
ON messages(urgency_level, status);

-- Insert default canned responses
INSERT INTO canned_responses (title, message_text, category) VALUES
('Loan Disbursement Delay', 'Thank you for reaching out. We understand your concern regarding the loan disbursement. Our team is actively working on this and your funds should be credited within 24-48 hours. We apologize for any inconvenience.', 'LOAN'),
('Account Access Issue', 'We''re sorry you''re experiencing difficulty accessing your account. Please try resetting your password using the "Forgot Password" option. If the issue persists, our technical team will assist you immediately.', 'ACCOUNT'),
('Payment Confirmation', 'We have received your payment successfully. It may take 1-2 business days to reflect in your account. Thank you for your prompt payment.', 'PAYMENT'),
('General Inquiry', 'Thank you for contacting Branch support. We have received your message and will get back to you shortly with the information you need.', 'GENERAL'),
('Fraud Alert Response', 'We take security very seriously. Our fraud prevention team has been notified and will investigate this matter immediately. Please do not share any sensitive information via this channel.', 'SECURITY'),
('Document Verification', 'We have received your documents and they are currently under review. You will be notified within 24 hours once the verification is complete.', 'VERIFICATION'),
('Repayment Schedule', 'Your repayment schedule has been sent to your registered email address. You can also view it in the app under "My Loans" section.', 'LOAN'),
('Account Locked', 'Your account has been temporarily locked for security reasons. Please verify your identity by providing the requested documents, and we will unlock it within 2 hours.', 'SECURITY')
ON CONFLICT DO NOTHING;
