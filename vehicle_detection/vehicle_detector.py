import cv2
import numpy as np
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import json
import os
from datetime import datetime
import threading
from ultralytics import YOLO

class VehicleDetectionGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("CNG Station Vehicle Detection")
        self.root.geometry("1024x768")
        
        # Variables
        self.station_name = tk.StringVar()
        self.video_path = None
        self.is_processing = False
        self.frame_skip = 2  # Process every nth frame
        self.frame_count = 0
        self.processing_thread = None
        
        # Initialize YOLO model
        self.model = YOLO('yolov8n.pt')  # Load the YOLOv8 model
        
        # Create GUI elements
        self.create_widgets()
    
    def create_widgets(self):
        # Control Frame
        control_frame = tk.Frame(self.root)
        control_frame.pack(side=tk.TOP, fill=tk.X, padx=10, pady=5)
        
        # Station Name Entry
        tk.Label(control_frame, text="Enter CNG Station Name:").pack(side=tk.LEFT, padx=5)
        tk.Entry(control_frame, textvariable=self.station_name).pack(side=tk.LEFT, padx=5)
        
        # Video Upload Button
        tk.Button(control_frame, text="Upload Video", command=self.upload_video).pack(side=tk.LEFT, padx=5)
        
        # Start/Stop Processing Button
        self.process_button = tk.Button(control_frame, text="Start Processing", command=self.toggle_processing)
        self.process_button.pack(side=tk.LEFT, padx=5)
        
        # Status Label
        self.status_label = tk.Label(self.root, text="")
        self.status_label.pack(pady=5)
        
        # Video Display
        self.video_label = tk.Label(self.root)
        self.video_label.pack(pady=5)
        
        # Queue Length Display
        self.queue_label = tk.Label(self.root, text="Current Queue Length: 0", font=('Arial', 14, 'bold'))
        self.queue_label.pack(pady=5)
    
    def upload_video(self):
        self.video_path = filedialog.askopenfilename(
            filetypes=[("Video Files", "*.mp4 *.avi *.mov")]
        )
        if self.video_path:
            self.status_label.config(text=f"Video uploaded: {os.path.basename(self.video_path)}")
    
    def update_queue_length(self, queue_length):
        station_name = self.station_name.get()
        timestamp = datetime.now().isoformat()
        
        data = {
            "station_name": station_name,
            "queue_length": queue_length,
            "timestamp": timestamp
        }
        
        self.queue_label.config(text=f"Current Queue Length: {queue_length}")
        print(f"Queue length updated: {data}")
    
    def detect_vehicles(self, frame):
        # Run YOLOv8 inference on the frame
        results = self.model(frame, classes=[2, 3, 5, 7])  # Detect cars, motorcycles, buses, and trucks
        
        # Process the results
        detected_vehicles = []
        if results and len(results) > 0:
            result = results[0]
            for box in result.boxes:
                # Get box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                
                if conf > 0.3:  # Confidence threshold
                    detected_vehicles.append((x1, y1, x2, y2))
                    # Draw bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    # Add label
                    label = f"{result.names[cls]} {conf:.2f}"
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        return frame, len(detected_vehicles)
    
    def process_video(self):
        cap = cv2.VideoCapture(self.video_path)
        
        while self.is_processing and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Skip frames for performance
            self.frame_count += 1
            if self.frame_count % self.frame_skip != 0:
                continue
            
            # Process frame and detect vehicles
            processed_frame, vehicle_count = self.detect_vehicles(frame)
            
            # Update queue length
            self.update_queue_length(vehicle_count)
            
            # Convert frame for display
            frame_rgb = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
            frame_pil = Image.fromarray(frame_rgb)
            
            # Resize frame for display
            display_width = 800
            display_height = int(frame_pil.height * (display_width / frame_pil.width))
            frame_pil = frame_pil.resize((display_width, display_height), Image.Resampling.LANCZOS)
            
            frame_tk = ImageTk.PhotoImage(image=frame_pil)
            
            # Update GUI in thread-safe manner
            self.root.after(1, self._update_gui, frame_tk)
        
        cap.release()
        self.is_processing = False
        self.process_button.config(text="Start Processing")
        self.status_label.config(text="Processing completed")
    
    def _update_gui(self, frame_tk):
        self.video_label.imgtk = frame_tk
        self.video_label.configure(image=frame_tk)
    
    def toggle_processing(self):
        if not self.video_path or not self.station_name.get():
            messagebox.showerror("Error", "Please enter station name and upload a video first!")
            return
        
        if not self.is_processing:
            self.is_processing = True
            self.frame_count = 0
            self.process_button.config(text="Stop Processing")
            self.processing_thread = threading.Thread(target=self.process_video)
            self.processing_thread.daemon = True
            self.processing_thread.start()
            self.status_label.config(text="Processing video...")
        else:
            self.is_processing = False
            self.process_button.config(text="Start Processing")
            if self.processing_thread:
                self.processing_thread.join()
            self.status_label.config(text="Processing stopped")

def main():
    root = tk.Tk()
    app = VehicleDetectionGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
