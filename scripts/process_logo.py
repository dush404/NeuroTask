# script to process uploaded logo image
import cv2
import numpy as np

# Load the image
img = cv2.imread('d:/CODING/gemini CLI/chat-assets/logo-image.jpg') # Assuming this is the image provided by the user.

if img is not None:
    # Basic crop - focusing on the center intersecting SS logo
    height, width, _ = img.shape
    
    # Calculate crop coordinates based on visual estimation from the provided 16:9 image
    # Center is roughly at W: 50%, H: 45%
    # The logo itself is roughly 30% of the image height
    center_y = int(height * 0.45)
    center_x = int(width * 0.5)
    size = int(height * 0.45) # Box size
    
    y1 = max(0, center_y - size // 2)
    y2 = min(height, center_y + size // 2)
    x1 = max(0, center_x - size // 2)
    x2 = min(width, center_x + size // 2)
    
    cropped = img[y1:y2, x1:x2]
    
    # Optional: We could try to remove the white background, but a simple crop might be safer initially.
    # To remove background, let's create a mask using a threshold since it's a dark logo on white
    gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 230, 255, cv2.THRESH_BINARY_INV)
    
    # Create an alpha channel
    b, g, r = cv2.split(cropped)
    rgba = [b, g, r, mask]
    dst = cv2.merge(rgba, 4)
    
    output_path = 'd:/CODING/NeuroTask/assets/images/ai-logo.png'
    cv2.imwrite(output_path, dst)
    print(f"Successfully processed logo to {output_path}")
else:
    print("Could not find image. I need the absolute path to the uploaded image.")
