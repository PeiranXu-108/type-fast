#!/bin/bash

# Docker build and push script for Type Fast project
# Usage: ./docker-build.sh [IMAGE_NAME] [TAG]
# Example: ./docker-build.sh myusername/typefast v1.0.0

# Set variables with defaults, can be overridden by command line arguments
IMAGE_NAME="${1:-peiranxu2048/typefast}"
TAG="${2:-latest}"

echo "Starting Docker build for Type Fast project..."
echo "Image: $IMAGE_NAME:$TAG"

# Build the image
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    echo "Docker image built successfully!"
    
    # Ask user if they want to push to registry
    read -p "Do you want to push this image to Docker Hub? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please login to Docker Hub..."
        docker login
        
        if [ $? -eq 0 ]; then
            echo "Pushing image to Docker Hub..."
            docker push $IMAGE_NAME:$TAG
            
            if [ $? -eq 0 ]; then
                echo "Image pushed successfully!"
                echo "Image: $IMAGE_NAME:$TAG"
                echo "View at: https://hub.docker.com/repository/docker/${IMAGE_NAME%/*}/typefast"
            else
                echo "Failed to push image"
                exit 1
            fi
        else
            echo "Docker Hub login failed"
            exit 1
        fi
    else
        echo "Image built but not pushed. You can push it later with:"
        echo "   docker push $IMAGE_NAME:$TAG"
    fi
else
    echo "Docker image build failed"
    exit 1
fi
