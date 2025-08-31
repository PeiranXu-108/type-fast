# Docker Deployment Guide

This project supports containerized deployment using Docker.

## Quick Start

### 1. Build Image

```bash
# Build with default configuration
docker build -t typefast:latest .

# Or use custom tag
docker build -t myusername/typefast:v1.0.0 .
```

### 2. Run Container

```bash
# Basic run
docker run -d -p 8080:80 typefast:latest

# Custom port mapping
docker run -d -p 3000:80 typefast:latest

# Run in background with container name
docker run -d -p 8080:80 --name typefast-app typefast:latest
```

### 3. Access Application

Open your browser and visit: http://localhost:8080

## Use Pre-built Image

```bash
# Pull image from Docker Hub
docker pull peiranxu2048/typefast:latest

# Run image
docker run -d -p 8080:80 peiranxu2048/typefast:latest
```

## Advanced Configuration

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  typefast:
    image: peiranxu2048/typefast:latest
    # Or build locally
    # build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run:
```bash
docker-compose up -d
```

### Environment Variables

You can customize configuration through environment variables:

```bash
docker run -d -p 8080:80 \
  -e NODE_ENV=production \
  typefast:latest
```

## Development Environment

### Local Development Build

```bash
# Development mode build
docker build --target builder -t typefast:dev .

# Run development container
docker run -it --rm -v $(pwd):/app -p 3000:3000 typefast:dev
```

## Available Tags

- `latest` - Latest stable version
- `v1.0.0` - Specific version tag

## Troubleshooting

### Check Container Status

```bash
# View running containers
docker ps

# View container logs
docker logs <container_id>

# Enter container for debugging
docker exec -it <container_id> /bin/sh
```

### Common Issues

1. **Port Already in Use**
   ```bash
   # Use different port
   docker run -d -p 3000:80 typefast:latest
   ```

2. **Build Failure**
   ```bash
   # Clean cache and rebuild
   docker build --no-cache -t typefast:latest .
   ```

3. **Permission Issues**
   ```bash
   # May need sudo on Linux
   sudo docker run -d -p 8080:80 typefast:latest
   ```

## Related Documentation

- [Docker Official Documentation](https://docs.docker.com/)
- [Nginx Configuration Reference](https://nginx.org/en/docs/)
- [Project README](../README.md)

## Contributing

If you find Docker-related issues or have improvement suggestions, feel free to submit an Issue or Pull Request!
