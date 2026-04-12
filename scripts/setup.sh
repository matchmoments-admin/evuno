#!/bin/bash
# =============================================================================
# evuno — Local development setup
# Run once on a fresh Mac: ./scripts/setup.sh
# =============================================================================
set -e

echo "=== evuno local setup ==="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install with: brew install node"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required. Install with: brew install pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install with: brew install --cask docker"; exit 1; }

echo "Node.js: $(node --version)"
echo "pnpm:    $(pnpm --version)"
echo "Docker:  $(docker --version)"
echo ""

# Check .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "Fill in your API keys in .env.local before running the apps."
  echo ""
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Start Docker services
echo ""
echo "Starting Docker services..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U evuno -d evuno > /dev/null 2>&1; do
  sleep 2
done
echo "PostgreSQL is ready."

# Create MinIO bucket for CitrineOS
echo ""
echo "Creating MinIO bucket for CitrineOS..."
docker compose exec -T minio mc alias set local http://localhost:9000 evuno evuno_dev_minio 2>/dev/null || true
docker compose exec -T minio mc mb local/citrineos 2>/dev/null || true

echo ""
echo "=== Setup complete ==="
echo ""
echo "Services running:"
echo "  PostgreSQL:    localhost:5432  (databases: evuno, evuno_auth, evuno_citrine)"
echo "  Valkey:        localhost:6379"
echo "  RabbitMQ:      localhost:5672  (UI: http://localhost:15672  login: evuno/evuno_dev)"
echo "  MinIO:         localhost:9000  (Console: http://localhost:9001  login: evuno/evuno_dev_minio)"
echo "  Keycloak:      http://localhost:8080  (login: admin/admin)"
echo "  CitrineOS:     http://localhost:8081"
echo ""
echo "Next steps:"
echo "  1. Fill in API keys in .env.local"
echo "  2. Run: pnpm db:migrate"
echo "  3. Run: pnpm db:seed"
echo "  4. Run: pnpm dev"
