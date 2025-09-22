from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import uvicorn
import shutil
import os

# Load your trained YOLOv11 model
model = YOLO("app/models/best.pt")

# Initialize FastAPI app
app = FastAPI(title="Facial Emotion Detection API")

@app.get("/")
def root():
    return {"message": "YOLOv11 Facial Emotion Detection API is running!"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run prediction
        results = model(temp_file)

        predictions = []
        for r in results:
            for box in r.boxes:  # YOLOv11 detections
                cls_id = int(box.cls.cpu().numpy()[0])   # class index
                label = model.names[cls_id]              # class name (emotion)
                confidence = float(box.conf.cpu().numpy()[0]) * 100  # accuracy %

                predictions.append({
                    "mood": label,
                    "accuracy": round(confidence, 2)
                })

        # Remove temp file
        os.remove(temp_file)

        if not predictions:
            return JSONResponse(content={"message": "No emotion detected"}, status_code=200)

        return {"predictions": predictions}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


if __name__ == "__main__":
    # Run app locally for testing
    uvicorn.run(app, host="0.0.0.0", port=8000)
