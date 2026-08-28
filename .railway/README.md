# Railway IaC (optional)

Needs `railway` npm SDK (types for `railway/iac`) + Railway CLI ≥ 5.42.1.

```bash
cd .railway && npm install
railway login && railway link
# set secrets in dashboard (or replace preserve())
railway config plan
railway config apply
```

Dashboard-only path also fine: 2 services, root dirs `/frontend` + `/backend`, paste env from `frontend/.env.example` + `backend/.env.example`.

Backend uses `backend/Dockerfile` (Railway detects it). Frontend uses Railpack + `frontend/railpack.json`.
