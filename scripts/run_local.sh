#!/usr/bin/env bash
# Local Execution Launcher for KSP Trinetra Sentinel (Linux/macOS)

echo "=========================================================="
echo "[+] Launching KSP Trinetra Sentinel Full-Stack Local Engine"
echo "=========================================================="

# Step 0: Kill any existing processes running on Ports 8000, 3001, 3000
echo "[0/3] Cleaning up any active processes on Ports 8000, 3001, 3000..."
for port in 8000 3001 3000; do
  pid=$(lsof -t -i:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "  -> Terminating stale process on Port $port (PID: $pid)..."
    kill -9 $pid 2>/dev/null || true
  fi
done
sleep 1

# Start Python Microservices Engine on Port 8000
echo "[1/3] Starting Python ML Microservices Engine (Port 8000)..."
(cd backend/python-services && uvicorn api.main:app --reload --port 8000) &

# Start Catalyst API Gateway on Port 3001
echo "[2/3] Starting Zoho Catalyst API Gateway (Port 3001)..."
(cd functions/api_gateway && npm start) &

# Start Next.js Command Center UI on Port 3000
echo "[3/3] Starting Next.js Command Center UI (Port 3000)..."
(cd client && npm run dev) &

echo ""
echo "[OK] All services launched cleanly!"
echo "[*] Command Center UI : http://localhost:3000"
echo "[*] API Gateway Status : http://localhost:3001/api/health"
echo "[*] Python ML API Docs : http://localhost:8000/docs"
