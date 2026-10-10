import cv2
import numpy as np
import urllib.request
import os

# Download Haar cascade if not exists
cascade_path = "haarcascade_frontalface_default.xml"
if not os.path.exists(cascade_path):
    url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
    urllib.request.urlretrieve(url, cascade_path)

face_cascade = cv2.CascadeClassifier(cascade_path)

chrome = cv2.imread('public/images/chrome.png')
portrait = cv2.imread('public/images/portrait.png')

def get_face(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    if len(faces) == 0:
        return None
    # return the largest face
    faces = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)
    return faces[0]

face1 = get_face(chrome)
face2 = get_face(portrait)

if face1 is not None and face2 is not None:
    x1, y1, w1, h1 = face1
    x2, y2, w2, h2 = face2
    
    print(f"Chrome face: {face1}")
    print(f"Portrait face: {face2}")
    
    # Calculate scale factor to make face2 same size as face1
    scale = w1 / w2
    
    # Resize portrait
    new_w = int(portrait.shape[1] * scale)
    new_h = int(portrait.shape[0] * scale)
    resized_portrait = cv2.resize(portrait, (new_w, new_h))
    
    # Calculate the new position of the face in resized_portrait
    new_x2 = int(x2 * scale)
    new_y2 = int(y2 * scale)
    
    # Calculate translation needed to match face1 position
    tx = x1 - new_x2
    ty = y1 - new_y2
    
    # Create final image with same dimensions as chrome
    final = np.zeros_like(chrome)
    
    # Paste resized_portrait into final
    # Handle bounds
    y_start = max(0, ty)
    y_end = min(chrome.shape[0], ty + new_h)
    x_start = max(0, tx)
    x_end = min(chrome.shape[1], tx + new_w)
    
    py_start = max(0, -ty)
    py_end = py_start + (y_end - y_start)
    px_start = max(0, -tx)
    px_end = px_start + (x_end - x_start)
    
    final[y_start:y_end, x_start:x_end] = resized_portrait[py_start:py_end, px_start:px_end]
    
    cv2.imwrite('public/images/portrait_aligned.png', final)
    print("Face-aligned and saved!")
else:
    print("Could not detect faces in one or both images.")
