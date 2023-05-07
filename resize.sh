#!/bin/bash

# Set the size threshold (2MB)
threshold=2M

# Function to convert large images
function convert_large_images() {
  local dir="$1"
  local size_threshold="$2"

  find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) -size +"$size_threshold" | while read -r image; do
    echo "Resizing $image..."
    convert "$image" -resize 50% "${image%.*}_resized.${image##*.}"
    mv "${image%.*}_resized.${image##*.}" "$image"
  done
}

# Execute the function
convert_large_images "." $threshold

echo "Image resizing completed."

