/**
 * Railway Infrastructure as Code for PreboTools.
 *
 * Setup:
 *   1. railway login && railway link
 *   2. Edit secrets below (or set in dashboard, then use preserve())
 *   3. railway config plan
 *   4. railway config apply
 *
 * Or skip IaC: create 2 services in dashboard with root dirs /frontend and /backend.
 */
import {
  defineRailway,
  github,
  group,
  mysql,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

const REPO = "FrancoisSchoeman/PreboTools";

export default defineRailway(() => {
  const db = mysql("mysql");

  const media = volume("backend-media", {
    sizeMB: 2048,
  });

  const sharedMysql = {
    MYSQL_HOST: db.env.MYSQLHOST,
    MYSQL_PORT: db.env.MYSQLPORT,
    MYSQL_DATABASE: db.env.MYSQLDATABASE,
    MYSQL_USER: db.env.MYSQLUSER,
    MYSQL_PASSWORD: db.env.MYSQLPASSWORD,
  };

  const backend = service("backend", {
    source: github(REPO, { rootDirectory: "backend" }),
    // Dockerfile in /backend is used automatically (migrate + collectstatic + gunicorn)
    volumeMounts: {
      "/home/app/web/media": media,
    },
    env: {
      ...sharedMysql,
      DJANGO_ENV: "prod",
      MEDIA_ROOT: "/home/app/web/media",
      SECRET_KEY: preserve(),
      INTERNAL_API_KEY: preserve(),
      FRONTEND_ORIGIN: "https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}",
      CORS_ALLOWED_ORIGINS: "https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}",
      CSRF_TRUSTED_ORIGINS: "https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}",
      EMAIL_SERVER_HOST: preserve(),
      EMAIL_SERVER_PORT: preserve(),
      EMAIL_SERVER_USER: preserve(),
      EMAIL_SERVER_PASSWORD: preserve(),
      EMAIL_FROM: preserve(),
    },
  });

  const frontend = service("frontend", {
    source: github(REPO, { rootDirectory: "frontend" }),
    start: "npm run db:migrate && node .next/standalone/server.js",
    env: {
      ...sharedMysql,
      HOSTNAME: "0.0.0.0",
      NODE_ENV: "production",
      // Private network to Django (server-side only)
      BACKEND_URL: "http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:${{backend.PORT}}",
      BASE_URL: "https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}",
      NEXTAUTH_URL: "https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}",
      NEXTAUTH_SECRET: preserve(),
      INTERNAL_API_KEY: preserve(),
      ADMIN_EMAIL: preserve(),
      ALLOWED_DOMAIN: preserve(),
      EMAIL_SERVER_HOST: preserve(),
      EMAIL_SERVER_PORT: preserve(),
      EMAIL_SERVER_USER: preserve(),
      EMAIL_SERVER_PASSWORD: preserve(),
      EMAIL_FROM: preserve(),
      OPENAI_BASE_URL: preserve(),
      OPENAI_SECRET: preserve(),
      GOOGLE_SITE_VERIFICATION: preserve(),
    },
  });

  return project("PreboTools", {
    resources: [group("App", [frontend, backend, db, media])],
  });
});
