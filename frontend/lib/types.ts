export type Feed = {
  id: number;
  name: string;
  url: string;
  feed_type: string;
  file_format: string;
  date_created: string;
  date_modified: string;
};

export type FeedResults = {
  feed: {
    id: number;
    name: string;
    url: string;
    feed_type: string;
    file_format: string;
    date_created: string;
    date_modified: string;
  };
  products: FeedProduct[];
};

export type FeedProduct = {
  feed_id?: number;
  product_id: number;
  title: string;
  description: string;
  link: string;
  image_link: string;
  availability: string;
  price: string;
  color: string;
  product_type: string;
  brand: string;
  identifier_exists: string;
  material: string;
  condition: string;
  size: string;
  custom_attributes: string | null | object;
};

export type KeywordAnalysis = {
  id?: number;
  url: string;
  mapped_keyword: string;
  meta_title: string;
  meta_description: string;
  new_title: string;
  new_description: string;
  user_intent_analysis: string[];
  competitive_insights: string[];
  seo_content_recommendations: string[];
  content_and_blog_ideas: string[];
  faq_creation_and_enhancements: string[];
  date_created: string;
  date_modified: string;
};

export type KeywordAnalysisResults = {
  results: KeywordAnalysis;
};

export type LeadGenClient = {
  id: number;
  api_key: string;
  company_name: string;
  website_url: string;
  contact_email: string;
  timezone: string;
  internal_notes: string;
  is_active: boolean;
  google_offline_enabled: boolean;
  conversion_name: string;
  conversion_action_id: string;
  currency: string;
  default_conversion_value: string | null;
  last_submission_at: string | null;
  last_csv_export_at: string | null;
  date_created: string;
  date_modified: string;
};

export type LeadGenClientDetail = LeadGenClient & {
  form_endpoint: string;
  csv_endpoint: string;
};

export type LeadGenSubmission = {
  id: number;
  client_id: number;
  submission_uuid: string;
  gclid: string;
  gbraid: string;
  wbraid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  landing_page: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  email_sent: boolean;
  imported: boolean;
  lead_status: string;
  lead_score: string;
  submitted_at: string;
};

export type LeadGenSubmissionDetail = LeadGenSubmission & {
  raw_payload: Record<string, unknown>;
  conversion_value: string | null;
  conversion_currency: string;
  country_code: string;
  postal_code: string;
  email_sent_at: string | null;
  email_error: string;
  notification_email: string;
};

export type LeadGenStats = {
  todays_leads: number;
  total_leads: number;
  last_submission_at: string | null;
  last_csv_export_at: string | null;
};

export type LeadGenHealthCheck = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type LeadGenActivity = {
  id: number;
  client_id: number | null;
  event_type: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type LeadGenSmtpServer = {
  id: string;
  name: string;
  host: string;
  port: number;
  from_email: string;
  is_default: boolean;
  is_read_only: boolean;
  client_count: number;
  status_ok: boolean;
  status_detail: string;
};
