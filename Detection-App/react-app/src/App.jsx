import styles from "./style";
import { Clients, Navbar, Testimonials, Hero } from "./components";
import React, { useState } from "react";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictedClass, setPredictedClass] = useState("");

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  
  //   if (selectedFile) {
  //     const formData = new FormData();
  //     formData.append("file", selectedFile);
  
  //     fetch("/predict", {
  //       method: "POST",
  //       body: formData,
  //     })
  //       .then((response) => response.json()) // Parse the response as JSON
  //       .then((data) => {
  //         // Handle the response data
  //         const predictedClass = data.predicted_class;
  //         console.log("Predicted Class:", predictedClass);
  //         // ... do something with the predicted class
  //       })
  //       .catch((error) => {
  //         // Handle any errors that occur during the request
  //         console.error("Error sending POST request:", error);
  //       });
  //   }
  // };


  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
    console.log(file);
    setPredictedClass(file.name)
  };

  const handleUpload = () => {
    // console.log("attempting fetch");
    setPredictedClass(predictedClass + " is ...")

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        // Base64 encode the file
        const base64EncodedFile = reader.result.split(",")[1];

        // Send the base64 encoded file as part of the POST request
        fetch("/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mp3File: base64EncodedFile }),
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log("response");
            setPredictedClass(predictedClass.substring(0, predictedClass.length - 3) + data.response);
            console.log(data);
          })
          .catch((error) => {
            // Handle errors if any
          });
      }
    };

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  

  return (
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>

      
      <center>
        <div className={`bg-primary ${styles.flexStart}`}>
          <form className="col s12">
            <div className="row">
              <div className="input-field col s4">
                <label
                  htmlFor="fileInput"
                  className="bg-white text-black px-4 py-2 rounded-md cursor-pointer"
                >
                  Choose File
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".mp3"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="row center my-4">
              <button
                type="button"
                className="btn-large waves-effect waves-light orange bg-white text-black px-4 py-2 rounded-md cursor-pointer"
                onClick={handleUpload}
              >
                Identify
              </button>
            </div>
          </form>
        </div>
        <h2 className={styles.heading2}>{predictedClass}</h2>
      </center>

      <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Testimonials />
          <Clients />
        </div>
      </div>
    </div>
  );
};

export default App;
