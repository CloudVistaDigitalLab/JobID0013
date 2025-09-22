from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import shutil

# Load YOLO model once at startup
model = YOLO("models/best.pt")

app = FastAPI()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Save uploaded image temporarily
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run inference
    results = model(temp_file)

    # Extract predictions
    predictions = []
    for result in results:
        for box in result.boxes:
            predictions.append({
                "class": model.names[int(box.cls)],
                "confidence": float(box.conf),
                "bbox": box.xyxy.tolist()
            })

    return {"predictions": predictions}
 