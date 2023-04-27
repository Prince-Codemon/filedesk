import React, { useState } from "react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";

async function generatePdf(images) {
  const doc = new jsPDF();
  for (const image of images) {
    const dataUrl = await readImageDataUrl(image);
    const { width: originalWidth, height: originalHeight } = await getImageSize(
      dataUrl
    );
    //jo orginal image hai uska width nikal dega ye ↑
    const aspectRatio = originalWidth / originalHeight;
    let width = doc.internal.pageSize.getWidth() - 20; // ye x side se 1cm margin de dega
    let height = width / aspectRatio;
    if (height > doc.internal.pageSize.getHeight() - 20) {
      height = doc.internal.pageSize.getHeight() - 20; // ye y side se de dega margin
      width = height * aspectRatio;
    }
    const x = (doc.internal.pageSize.getWidth() - width) / 2;
    const y = (doc.internal.pageSize.getHeight() - height) / 2;
    doc.addImage(dataUrl, "JPEG", x, y, width, height);
    doc.addPage();
  }
  doc.deletePage(doc.getNumberOfPages()); // sala hamesha empty page bn jeta hai last mei usko delete krne ka jugad

  return doc;
}

function readImageDataUrl(file) {
  //img kaha hai usko pta krne ke liye
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getImageSize(dataUrl) {
  return new Promise((resolve, reject) => {
    //img ka size pta krne ke liye
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function App() {
  const [images, setImages] = useState([]);
  const [filesArray, setFilesArray] = useState([]);

  async function handleFileInputChange(event) {
    //jitne bhi img hai usko array mei dal dega
    const selectedFiles = event.target.files;
    const files = Array.from(selectedFiles);
    const filesArray = Array.from(selectedFiles).map((file) => file.name);

    setImages(files);
    setFilesArray(filesArray);
  }
  const date = new Date();
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  const timestamp = date
    .toLocaleString("en-in", options)
    .replace(",", "__")
    .replace(" ", "");

  async function handleSavePdf() {
    //save ke liye
    const pdf = await generatePdf(images);
    const fileName=`Img2Pdf_${timestamp}`;
    pdf.save(fileName);
  }

  return (
    <div className="container center my-5 row pop">
      <div className="col-lg-6 col-md-9 col-sm-12 ">
        <h2 className="stroke fs-2 p-1 ls-1 my-2 center">
          Add multiple images to PDF
        </h2>

        <div className="d-flex justify-content-evenly center my-4">
          <span className="dim fs-5 fw-bold mx-4">
            Total Images : {images.length}
          </span>
          <motion.label
            whileHover={{ scale: 1.1 }}
            htmlFor="formFileLg"
            className="u-f-b choosefile m-2 center"
          >
            {images.length === 0 ? "Upload Files" : "Upload More?"}
            <input
              multiple
              className="form-control u-f-b form-control-lg choosefile shadow-in hidden"
              id="formFileLg"
              accept="image/*"
              type="file"
              onChange={handleFileInputChange}
            />
          </motion.label>
        </div>
        {filesArray && filesArray.length > 0 && (
          <div className="dim fs-5">
            Selected Files:
            <ul>
              {filesArray.map((item, id) => {
                return (
                  <li className="text-dark" key={id}>
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div className="row  center">
        <div className="col-lg-6 col-md-10 col-sm-12">
          {images.length > 0 ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="shadow-out m-5 shadow-btn dim"
              onClick={handleSavePdf}
            >
              Save PDF
            </motion.button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
