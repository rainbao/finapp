# 🚀 Deployment Guide

Complete guide for deploying finapp to production with Docker.

---

## 📋 Table of Contents
- [Local Development with Docker](#local-development-with-docker)
- [Deploy to Railway](#deploy-to-railway)
- [Deploy to Render](#deploy-to-render)
- [Deploy to AWS](#deploy-to-aws)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)

---

## 🐳 Local Development with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/rainbao/finapp.git
   cd finapp
   ```

2. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - App: http://localhost:8080
   - Database: localhost:5432

4. **View logs**
   ```bash
   docker-compose logs -f app
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

### Build Docker Image Manually
```bash
# Build the image
docker build -t finapp:latest .

# Run the container
docker run -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://host.docker.internal:5432/finapp" \
  -e DB_USERNAME="finapp_user" \
  -e DB_PASSWORD="finapp_password" \
  -e JWT_SECRET="your-secret-key-min-256-bits" \
  finapp:latest
```

---

## 🚂 Deploy to Railway

Railway offers the easiest deployment with built-in PostgreSQL and free tier.

### Step 1: Prepare Railway
1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

### Step 2: Create New Project
```bash
railway login
railway init
```

### Step 3: Add PostgreSQL
```bash
railway add
# Select PostgreSQL
```

### Step 4: Deploy
```bash
railway up
```

### Step 5: Configure Environment Variables
In Railway dashboard, add these variables:

```env
# Railway provides DATABASE_URL automatically
DB_URL=${{Postgres.DATABASE_URL}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Add your secrets
JWT_SECRET=your-production-secret-min-256-bits-long
JWT_EXPIRATION=3600000

COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
COOKIE_HTTP_ONLY=true

JPA_DDL_AUTO=update
```

### Step 6: Generate Domain
Railway auto-generates a domain like: `finapp.up.railway.app`

**🎉 Your app is live!**

---

## 🎨 Deploy to Render

Render provides free tier with Docker support and managed PostgreSQL.

### Step 1: Prepare Repository
1. Push code to GitHub
2. Create account at [render.com](https://render.com)

### Step 2: Create PostgreSQL Database
1. Dashboard → New → PostgreSQL
2. Name: `finapp-db`
3. Copy the **Internal Database URL**

### Step 3: Create Web Service
1. Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finapp`
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free

### Step 4: Add Environment Variables
```env
DB_URL=<Internal Database URL from Step 2>
DB_USERNAME=<from database connection info>
DB_PASSWORD=<from database connection info>

JWT_SECRET=your-production-secret-min-256-bits-long
JWT_EXPIRATION=3600000

COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
COOKIE_HTTP_ONLY=true

JPA_DDL_AUTO=update
PORT=8080
```

### Step 5: Deploy
Click **Create Web Service** - Render auto-deploys!

**Live URL**: `https://finapp.onrender.com`

---

## ☁️ Deploy to AWS (Elastic Beanstalk)

Most impressive for resume - shows enterprise cloud experience.

### Prerequisites
- AWS Account (Free tier available)
- AWS CLI installed
- EB CLI installed

### Step 1: Install EB CLI
```bash
pip install awsebcli
```

### Step 2: Initialize EB Application
```bash
eb init -p docker finapp --region us-east-1
```

### Step 3: Create RDS Database
```bash
# Create database through AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier finapp-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username finapp_admin \
  --master-user-password <strong-password> \
  --allocated-storage 20
```

### Step 4: Create Dockerrun.aws.json
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "ghcr.io/rainbao/finapp:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 8080,
      "HostPort": 8080
    }
  ]
}
```

### Step 5: Create Environment
```bash
eb create finapp-prod --database --database.engine postgres
```

### Step 6: Set Environment Variables
```bash
eb setenv \
  DB_URL="jdbc:postgresql://<rds-endpoint>:5432/finapp" \
  DB_USERNAME="finapp_admin" \
  DB_PASSWORD="<your-password>" \
  JWT_SECRET="<your-secret>" \
  COOKIE_SECURE="true" \
  JPA_DDL_AUTO="update"
```

### Step 7: Deploy
```bash
eb deploy
```

### Step 8: Open Application
```bash
eb open
```

**Cost**: ~$15-20/month (Free tier: first 12 months)

---

## 🔐 Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/finapp` |
| `DB_USERNAME` | Database username | `finapp_user` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `JWT_SECRET` | JWT signing key (min 256 bits) | `your-secret-key-min-256-bits` |

### Optional Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRATION` | `3600000` | Token expiration (ms) |
| `COOKIE_MAX_AGE` | `3600` | Cookie lifetime (seconds) |
| `COOKIE_SECURE` | `false` | HTTPS-only cookies |
| `COOKIE_SAME_SITE` | `Lax` | SameSite policy |
| `SERVER_PORT` | `8080` | Application port |
| `JPA_DDL_AUTO` | `update` | Hibernate DDL mode |

### Production Recommendations
```env
# Security
JWT_SECRET=<generate 64+ character random string>
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
COOKIE_HTTP_ONLY=true

# Database
JPA_DDL_AUTO=validate  # Don't auto-modify schema
JPA_SHOW_SQL=false     # Don't log SQL

# Performance
DB_POOL_SIZE_MIN=10
DB_POOL_SIZE_MAX=50
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
1. ✅ Builds application on every push
2. ✅ Runs tests
3. ✅ Builds Docker image
4. ✅ Pushes to GitHub Container Registry
5. ⏸️ Deploys to production (optional - uncomment in workflow)

### Enable Container Registry
1. Repository → Settings → Actions → General
2. Workflow permissions → Read and write permissions

### Add Railway Auto-Deploy (Optional)
1. Get Railway token: `railway login && railway whoami --token`
2. GitHub → Settings → Secrets → New secret
   - Name: `RAILWAY_TOKEN`
   - Value: `<your-token>`
3. Uncomment `deploy-railway` job in `.github/workflows/ci-cd.yml`

---

## 📊 Health Checks & Monitoring

### Health Endpoint
```bash
curl http://localhost:8080/actuator/health
```

### Docker Health Check
Built into Dockerfile - checks every 30 seconds:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:8080/actuator/health
```

### View Container Health
```bash
docker ps
# Look for health status in output
```

---

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Common issues:
# - Database not ready: Wait for postgres health check
# - Port conflict: Change port mapping in docker-compose.yml
# - Environment variables missing: Check .env file
```

### Database connection errors
```bash
# Test database connectivity
docker-compose exec postgres psql -U finapp_user -d finapp

# Reset database
docker-compose down -v
docker-compose up -d
```

### Build failures
```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

---

## 📈 Performance Optimization

### Docker Image Size
- Multi-stage build reduces size from ~800MB to ~200MB
- Alpine base image for minimal footprint
- Layer caching speeds up rebuilds

### JVM Settings
Optimized for container environments:
```bash
-XX:+UseContainerSupport
-XX:MaxRAMPercentage=75.0
-XX:+UseG1GC
```

### Database Connection Pool
HikariCP configured for optimal performance:
- Min connections: 5 (dev) / 10 (prod)
- Max connections: 20 (dev) / 50 (prod)

---

## 🔒 Security Checklist

- [x] Multi-stage Docker build (no source code in final image)
- [x] Non-root user in container
- [x] HTTPS-only cookies in production
- [x] Environment variables for secrets (not hardcoded)
- [x] JWT tokens with secure secrets
- [x] Database connection pooling with timeouts
- [x] Health checks for reliability
- [x] .dockerignore to exclude sensitive files

---

## 📞 Support

**Issue with deployment?** Create an issue on GitHub!

**Live Demo**: [Add your deployment URL here]

**Repository**: https://github.com/rainbao/finapp
