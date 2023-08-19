import { useState } from "react";
import styles from "../style";

const Hero = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };
  return (
    <section id="home" className={`flex md:flex-row flex-col ${styles.paddingY}`}>
      <div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-col">
            <h1 className="font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100.8px] leading-[75px]">
              The Next <br className="sm:block hidden" />{" "}
              <span className="text-gradient">Generation Of</span>{" "}
            </h1>
            <h1 className="font-poppins font-semibold ss:text-[68px] text-[52px] text-white ss:leading-[100.8px] leading-[75px] w-full">
              Music Detection.
            </h1>
          </div>
        </div>
      </div>
      <div className="section no-pad-bot" id="index-banner">
        <div className="container">
          <br /><br />

          <div className="row">
            <form action="/predict" method="post" className="col s12">
              <div className="row">
                <div className="input-field col s4">
                  <label htmlFor="fileInput" className="bg-white text-black px-4 py-2 rounded-md cursor-pointer">
                    Choose File
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".mp3"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p style={{ color: "white" }}>{selectedFile && selectedFile.name}</p>
                </div>
              </div>
              <div className="row center my-4"> {/* Added 'my-4' class for vertical margin */}
                <button type="submit" className="btn-large waves-effect waves-light orange bg-white text-black px-4 py-2 rounded-md cursor-pointer">
                  Identify
                </button>
              </div>
            </form>
            <br>{identificationResult}</br>
          </div>



          

        </div>
      </div>
    </section>
  );
};


export default Hero;