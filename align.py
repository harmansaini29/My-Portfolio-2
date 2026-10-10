import cv2
import numpy as np

# Load images
chrome = cv2.imread('public/images/chrome.png')
portrait = cv2.imread('public/images/portrait.png')

# Convert to grayscale
gray_chrome = cv2.cvtColor(chrome, cv2.COLOR_BGR2GRAY)
gray_portrait = cv2.cvtColor(portrait, cv2.COLOR_BGR2GRAY)

# Initialize ORB detector
orb = cv2.ORB_create(nfeatures=5000)

# Find keypoints and descriptors
kp1, des1 = orb.detectAndCompute(gray_portrait, None)
kp2, des2 = orb.detectAndCompute(gray_chrome, None)

# Match features
matcher = cv2.DescriptorMatcher_create(cv2.DESCRIPTOR_MATCHER_BRUTEFORCE_HAMMING)
matches = matcher.match(des1, des2, None)

# Sort matches by score
matches = sorted(matches, key=lambda x: x.distance)

# Keep top matches
good_matches = matches[:500]

# Extract location of good matches
points1 = np.zeros((len(good_matches), 2), dtype=np.float32)
points2 = np.zeros((len(good_matches), 2), dtype=np.float32)

for i, match in enumerate(good_matches):
    points1[i, :] = kp1[match.queryIdx].pt
    points2[i, :] = kp2[match.trainIdx].pt

# Find affine transform instead of homography if we just want scale/translate
# But homography will work too. A rigid transform might be better to avoid skewing.
m, inliers = cv2.estimateAffinePartial2D(points1, points2, method=cv2.RANSAC)

# Use affine transform to warp image
height, width, channels = chrome.shape
portrait_aligned = cv2.warpAffine(portrait, m, (width, height), borderMode=cv2.BORDER_REPLICATE)

cv2.imwrite('public/images/portrait_aligned.png', portrait_aligned)
print("Aligned and saved as portrait_aligned.png!")
