#!/bin/bash

# Test Main Video Script Generation
echo "Testing Main Video Script Generation..."
curl -X POST http://localhost:5001/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "main_video",
    "topic": "Photosynthesis",
    "grade": "8",
    "learningObjectives": ["Define photosynthesis", "Identify inputs and outputs", "Explain importance"]
  }'
echo -e "\n\n"

# Test Story Video Script Generation
echo "Testing Story Video Script Generation..."
curl -X POST http://localhost:5001/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "story_video",
    "topic": "Photosynthesis",
    "grade": "8",
    "missedConcepts": ["Role of sunlight", "Oxygen as byproduct"]
  }'
echo -e "\n\n"

# Test Analogy Video Script Generation
echo "Testing Analogy Video Script Generation..."
curl -X POST http://localhost:5001/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "analogy_video",
    "topic": "Photosynthesis",
    "grade": "8",
    "missedConcepts": ["Chloroplast function"]
  }'
echo -e "\n\n"

# Test Adaptive Test Generation
echo "Testing Adaptive Test Generation..."
curl -X POST http://localhost:5001/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "topic": "Photosynthesis",
    "grade": "8",
    "scriptContent": "Photosynthesis is the process...",
    "difficulty": "medium"
  }'
echo -e "\n\n"
