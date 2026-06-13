# Stage 1: Build the React frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve using Python FastAPI
FROM python:3.10-slim
WORKDIR /app

# Install build dependencies for compiling packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy built files and Python source from builder
COPY --from=frontend-builder /app /app

EXPOSE 8500

# Execute uvicorn server, binding to the PORT environment variable
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8500}"]