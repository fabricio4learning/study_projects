CREATE TABLE IF NOT EXISTS url_shortener.url_mapping (
    short_code text PRIMARY KEY,
    long_url text,
    redirect_type text,
    created_at timestamp
);
 