declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** Cloudflare Access team URL, e.g. https://gemsforge.cloudflareaccess.com (self-hosting only). */
    ACCESS_TEAM_DOMAIN?: string;
    /** Cloudflare Access application Audience (AUD) tag (self-hosting only). */
    ACCESS_AUD?: string;
  }
}
