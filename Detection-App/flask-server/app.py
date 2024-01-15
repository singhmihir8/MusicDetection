# importing packages
import awsgi
from flask import Flask, request
from flask_cors import CORS
import base64
import librosa
import matplotlib.pyplot as plt
import librosa.display
import numpy as np
import os
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models




class AI_Detection_Model(nn.Module):
    def __init__(self, num_classes, num_layers, pretrained=True):
        super(AI_Detection_Model, self).__init__()
        if num_layers == 18:
            self.resnet = models.resnet18(
                weights='ResNet18_Weights.IMAGENET1K_V1')
        elif num_layers == 34:
            self.resnet = models.resnet34(
                weights='ResNet34_Weights.IMAGENET1K_V1')
        elif num_layers == 50:
            self.resnet = models.resnet50(
                weights='ResNet50_Weights.IMAGENET1K_V1')

        self.resnet.fc = nn.Linear(self.resnet.fc.in_features, num_classes)

    def forward(self, x):
        x = self.resnet(x)
        return x


def crop_image(file):
    # Opens a image in RGB mode
    im = Image.open(file)

    # Size of the image in pixels (size of original image)
    # (This is not mandatory)
    width, height = im.size

    # Setting the points for cropped image
    left = 0
    top = height // 9
    right = width
    bottom = height

    # Cropped image of above dimension
    # (It will not change original image)
    im1 = im.crop((left, top, right, bottom))

    # Shows the image in image viewer
    im1 = im1.save(file)

# Function to convert audio file to spectrogram image and save as JPEG


def audio_to_spectrogram(audio_file, output_file):
    # Load the audio file
    # Specify duration of 30 seconds
    audio, sr = librosa.load(audio_file, duration=30.0)

    # Create a spectrogram image
    D = librosa.amplitude_to_db(np.abs(librosa.stft(audio)), ref=np.max)
    plt.figure(figsize=(10, 4))
    librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='log')
    plt.colorbar(format='%+2.0f dB')

    # Save the spectrogram as a JPEG image
    plt.savefig(output_file, format='jpg')

    # Close the plot
    plt.close()

    crop_image(output_file)

# Define the function for testing a single image


def test_single_image(image_path, transform):
    # load model
    device = torch.device('mps')
    model_path = getParentDirectory() + '/saved_resnet18_1691910656.348921(78%).pt'
    num_layers = 18
    model = AI_Detection_Model(num_classes=2, num_layers=num_layers)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    # Load and preprocess the image
    image = Image.open(image_path)

    input_image = transform(image)

    # Prepare the input tensor
    # Add an extra dimension to represent the batch (batch_size=1)
    input_tensor = input_image.unsqueeze(0)

    # Move the image to the device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    input_tensor = input_tensor.to(device)

    model.eval()

    # Forward pass the input through the model
    output = model(input_tensor)

    # Interpret the output
    probabilities = torch.softmax(output, dim=1)

    # Extract the predicted class
    _, predicted_class = torch.max(probabilities, 1)

    return "AI Music" if predicted_class.item() == 0 else 'Real Music'


# Define transformations for the input images
transform = transforms.Compose([
    #     transforms.Resize((1000, 400)),
    #     transforms.ToTensor()
    transforms.Resize((560, 224)),
    transforms.ToTensor(),
    #     transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


def getParentDirectory():
    return os.path.abspath(os.path.join(__file__, os.pardir))


app = Flask(__name__, static_folder="../react-app/dist", static_url_path="/")
CORS(app)


@app.route("/")
def index():
    return app.send_static_file('index.html')


@app.route("/test")
def connection_test():
    return {"test": "test"}


@app.route("/predict", methods=['POST'])
def predict():
    response = None
    if (request.is_json):
        response = request.get_json()
        base64_bytes = response['mp3File']
        sample_string_bytes = base64.b64decode(base64_bytes)
        mp3_file = open(os.path.dirname(__file__) + "/temp.mp3", "wb")
        mp3_file.write(sample_string_bytes)

        plt.switch_backend('Agg')

        # Provide the input MP3 file path and output spectrogram image path
        input_audio_path = getParentDirectory() + "/temp.mp3"
        output_image_path = getParentDirectory() + '/spectro.jpg'

        # Convert the audio file to spectrogram image and save as JPEG
        audio_to_spectrogram(input_audio_path, output_image_path)

        predicted_class = test_single_image(
            output_image_path, transform)

    return {"response": predicted_class}


def lambda_handler(event, context):
    return awsgi.response(app, event, context, base64_content_types={"image/png"})

if __name__ == "__main__":
    app.run(port=8000, debug=True)
