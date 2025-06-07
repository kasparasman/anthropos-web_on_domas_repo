Embeded react webcam component
Load face det model with MediaPipe on async
UI shows state - Face detected = True/False
Captures burst of 3 images - draws video frames to image data using hidden canvas

Liveness 


Architecture Diagram: The flow involves the browser (client) doing video capture & local analysis, and the server doing AWS calls. This separation keeps AWS credentials and face data matching on the server side (secure) and takes advantage of the browser for UI and initial processing.

First step of development is to get the face detection working. We will mock the aws rekognition for now, and just try to make the face detection, and capturing of frames work. 