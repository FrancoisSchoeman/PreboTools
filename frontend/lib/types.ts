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
