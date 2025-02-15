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
