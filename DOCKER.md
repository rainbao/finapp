# finapp Docker & Deployment Configuration

This directory contains Docker and deployment configuration files.

## Files Overview

- `Dockerfile` - Multi-stage production Docker build
- `docker-compose.yml` - Local development with PostgreSQL
- `docker-compose.prod.yml` - Production overrides
- `.dockerignore` - Files excluded from Docker builds
- `.env.example` - Environment variable template
- `start-docker.bat` / `start-docker.sh` - Quick start scripts

## Quick Commands

```bash
# Start everything (easiest)
docker-compose up -d

# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## Docker Image Details

**Base Images:**
- Build stage: `maven:3.9-eclipse-temurin-21-alpine`
- Runtime stage: `eclipse-temurin:21-jre-alpine`

**Optimizations:**
- Multi-stage build (reduces size by ~75%)
- Layer caching for dependencies
- Non-root user for security
- Health checks built-in
- JVM tuning for containers

**Final Image Size:** ~200MB (vs ~800MB without optimization)

## Environment Configuration

See `.env.example` for all available variables.

**Required:**
- `DB_URL` - PostgreSQL connection string
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing key (min 256 bits)

**Optional but recommended:**
- `COOKIE_SECURE=true` - For production HTTPS
- `JPA_DDL_AUTO=validate` - For production (no auto-schema changes)
- `DB_POOL_SIZE_MAX=50` - For production load

## Production Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete guides on:
- Railway deployment (easiest)
- Render deployment (free tier)
- AWS Elastic Beanstalk (enterprise)
- Manual Docker deployment

## Security Features

✅ Multi-stage builds (no source code in final image)
✅ Non-root user in container
✅ Minimal Alpine base images
✅ Health checks for reliability
✅ .dockerignore to exclude sensitive files
✅ Environment-based configuration (no hardcoded secrets)

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:
1. Builds and tests on push
2. Creates Docker image
3. Pushes to GitHub Container Registry
4. Optionally deploys to production

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs app
```

**Database connection issues:**
```bash
docker-compose exec postgres psql -U finapp_user -d finapp
```

**Fresh start:**
```bash
docker-compose down -v
docker-compose up -d
```

**Check health:**
```bash
docker ps  # Look for health status
curl http://localhost:8080/actuator/health
```
