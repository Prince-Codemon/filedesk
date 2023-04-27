import PDFMerger from "pdf-merger-js/browser";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";


const Merger = () => {
  const [mergedPdfBlob, setMergedPdfBlob] = useState();
  const [files, setFiles] = useState([]);
  const [filesArray, setFilesArray] = useState([]);
  const [error, seterror] = useState("");

  const handleFileInputChange = (event) => {
    const selectedFiles = event.target.files;
    const filesArray = Array.from(selectedFiles).map((file) => file.name);
    setFiles(selectedFiles);
    if (selectedFiles.length < 2) {
      seterror("Please select more than 1 files to merge !!");
      setFilesArray([]);
      return;
    }
    setFilesArray(filesArray);
  };

  const handleMergeButtonClick = async () => {
    const merger = new PDFMerger();

    for (const file of files) {
      await merger.add(file);
    }

    const mergedPdf = await merger.saveAsBlob();
    setMergedPdfBlob(mergedPdf);
  };

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

  // Download the merged pdf
  const handleDownloadClick = () => {
    const url = URL.createObjectURL(mergedPdfBlob);
    const fileName = `merged_${timestamp}.pdf`; // Generate a unique name
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  useEffect(() => {
    setMergedPdfBlob(null);
  }, [files]);
  return (
    <div className="container pop my-5 row center">
      <div className="col-lg-7 col-md-10 col-sm-12 my-4">
        <h2 className="stroke ls-2 my-2 center">
          Merge Multiple Pdfs into One!!
        </h2>
        <div className="d-flex justify-content-around center ">
          <div className="dim fs-5 fw-bold">Total Files : {files.length}</div>
          <motion.label
            whileHover={{ scale: 1.05 }}
            htmlFor="mergePdf"
            className="u-f-b my-3 center"
          >
            {files.length === 0 || files.length === 1
              ? "Upload Files"
              : "Upload More?"}
            <input
              className="form-control"
              type="file"
              id="mergePdf"
              onChange={handleFileInputChange}
              multiple
              accept=".pdf"
            />
          </motion.label>
        </div>
        <div className="text-danger fs-5">{files.length < 2 ? error : ""}</div>
        {filesArray && filesArray.length > 0 && (
          <div className="dim fs-5">
            Selected Files:
            <ul>{filesArray.map((item,id)=>{
              return <li className="text-dark" key={id}>{item}</li>
            })}</ul>
          </div>
        )}

        <div className="container m-5">
          {mergedPdfBlob && (
            <button
              className="shadow-btn dim fs-5  shadow-out"
              onClick={handleDownloadClick}
            >
              Download
            </button>
          )}
          {files.length > 1 && !mergedPdfBlob && (
            <button
              className="shadow-btn dim fs-5  shadow-out"
              onClick={handleMergeButtonClick}
            >
              Merge
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Merger;
