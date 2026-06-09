FROM python:3.10-slim

WORKDIR /app

# Install build dependencies for compiling sentencepiece and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose default container port
EXPOSE 8501

# Execute streamlit, falling back to port 8501 if no PORT environment variable is configured
CMD ["sh", "-c", "streamlit run app.py --server.port=${PORT:-8501} --server.address=0.0.0.0"]