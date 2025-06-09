CREATE TABLE IF NOT EXISTS pages(
  id text PRIMARY KEY,
  url text UNIQUE NOT NULL,
  title text,
  raw_content text,
  cleaned_content text,
  summary text,
  user_friendly_description text,
  keywords text,
  department text,
  service_category text,
  page_type text,
  language TEXT
  DEFAULT 'en',
  content_hash text,
  meta_description text,
  breadcrumbs text,
  last_crawled DATETIME,
  last_processed DATETIME,
  last_indexed DATETIME,
  status text DEFAULT 'pending',
  crawl_depth integer DEFAULT 0,
  parent_url text,
  http_status integer,
  content_type text,
  file_size integer,
  load_time real,
  error_message text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links(
  id text PRIMARY KEY,
  source_page_id text,
  target_url text NOT NULL,
  anchor_text text,
  link_type text,
  link_context text,
  position_in_page integer,
  is_navigation boolean DEFAULT FALSE,
  is_main_content boolean DEFAULT FALSE,
  rel_attributes text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crawl_queue(
  id text PRIMARY KEY,
  url text UNIQUE NOT NULL,
  priority integer DEFAULT 0,
  queue_type text DEFAULT 'discovery',
  scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  status text DEFAULT 'pending',
  worker_id text,
  started_at DATETIME,
  completed_at DATETIME,
  error_message text,
  metadata text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processing_queue(
  id text PRIMARY KEY,
  page_id text NOT NULL,
  task_type text NOT NULL,
  status text DEFAULT 'pending',
  priority integer DEFAULT 0,
  input_data text,
  output_data text,
  model_used text,
  tokens_used integer,
  processing_time real,
  cost REAL,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  error_message text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_analytics(
  id text PRIMARY KEY,
  query text NOT NULL,
  normalized_query text,
  results_count integer,
  clicked_result_id text,
  clicked_position integer,
  user_session text,
  user_location text,
  search_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_time real,
  filters_used text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domains(
  id text PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  domain_type text,
  crawl_enabled boolean DEFAULT TRUE,
  crawl_delay integer DEFAULT 1000,
  max_depth integer DEFAULT 3,
  robots_txt text,
  sitemap_urls text,
  last_robots_check DATETIME,
  priority integer DEFAULT 0,
  notes text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback(
  id text PRIMARY KEY,
  query text,
  page_id text,
  feedback_type text,
  rating integer,
  comment text,
  user_session text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

CREATE INDEX IF NOT EXISTS idx_pages_department ON pages(department);

CREATE INDEX IF NOT EXISTS idx_pages_service_category ON pages(service_category);

CREATE INDEX IF NOT EXISTS idx_pages_last_crawled ON pages(last_crawled);

CREATE INDEX IF NOT EXISTS idx_pages_content_hash ON pages(content_hash);

CREATE INDEX IF NOT EXISTS idx_links_source_page ON links(source_page_id);

CREATE INDEX IF NOT EXISTS idx_links_target_url ON links(target_url);

CREATE INDEX IF NOT EXISTS idx_links_link_type ON links(link_type);

CREATE INDEX IF NOT EXISTS idx_crawl_queue_status ON crawl_queue(status);

CREATE INDEX IF NOT EXISTS idx_crawl_queue_priority ON crawl_queue(priority DESC);

CREATE INDEX IF NOT EXISTS idx_crawl_queue_scheduled ON crawl_queue(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON processing_queue(status);

CREATE INDEX IF NOT EXISTS idx_processing_queue_page_id ON processing_queue(page_id);

CREATE INDEX IF NOT EXISTS idx_processing_queue_task_type ON processing_queue(task_type);

CREATE INDEX IF NOT EXISTS idx_processing_queue_priority ON processing_queue(priority DESC);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(normalized_query);

CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(search_timestamp);

CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(DOMAIN);

CREATE INDEX IF NOT EXISTS idx_domains_crawl_enabled ON domains(crawl_enabled);

