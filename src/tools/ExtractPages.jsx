import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { motion } from "framer-motion";

export default function ExtractPages() {
  const [pdfFileData, setPdfFileData] = useState();
  const [pdfPagesCount, setPdfPagesCount] = useState();
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, seterror] = useState("");
  const [pagesExtracted, setPagesExtracted] = useState(false);
  const [filesArray, setFilesArray] = useState([]);


  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function renderPdf(uint8array) {
    const tempblob = new Blob([uint8array], {
      type: "application/pdf",
    });
    const docUrl = URL.createObjectURL(tempblob);
    setPdfFileData(docUrl);

    const pdfDoc = await PDFDocument.load(uint8array);
    setPdfPagesCount(pdfDoc.getPageCount());
  }

  async function extractPdfPages() {
    const fromPage = parseInt(document.getElementById("fromPage").value);
    const toPage = parseInt(document.getElementById("toPage").value);

    if (fromPage && toPage && fromPage <= toPage && toPage <= pdfPagesCount) {
      const pdfSrcDoc = await PDFDocument.load(
        await fetch(pdfFileData).then((res) => res.arrayBuffer())
      );
      const pdfNewDoc = await PDFDocument.create();
      const pages = await pdfNewDoc.copyPages(
        pdfSrcDoc,
        Array.from(
          { length: toPage - fromPage + 1 },
          (_, i) => fromPage + i - 1
        )
      );
      pages.forEach((page) => pdfNewDoc.addPage(page));
      const newPdf = await pdfNewDoc.save();
      const newPdfUrl = URL.createObjectURL(
        new Blob([newPdf], { type: "application/pdf" })
      );

      // Replace original PDF with extracted pages
      setPdfFileData(newPdfUrl);
      setPdfPagesCount(pages.length);
      setPagesExtracted(true);
    } else {
      seterror("Enter a Page Range !!");
    }
  }
  // Execute when user select a file
  const onFileSelected = async (e) => {
    const fileList = e.target.files;
    const filesArray = Array.from(fileList).map((file) => file.name);

    setTotalFiles(fileList.length);
    if (fileList?.length > 0) {
      const pdfArrayBuffer = await readFileAsync(fileList[0]);
      await renderPdf(pdfArrayBuffer);
    }
    setFilesArray(filesArray);

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
  const downloadPdf = () => {
    if (pdfFileData) {
      const link = document.createElement("a");
      link.href = pdfFileData;
      link.download = `extracted-pages_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container pop my-5 row center">
      <div className="col-lg-7 col-md-10 col-sm-12">
        <h1 className="stroke my-4 center p-1 ls-2">Extract Pages from PDF</h1>
        <div className="d-flex justify-content-around center">
          <span className="dim fs-5 fw-bold">Total Files : {totalFiles}</span>
          <motion.label
            whileHover={{ scale: 1.1 }}
            htmlFor="extract-pdf"
            className="u-f-b center"
          >
            {pdfFileData ? "Upload More?" : "Upload Files"}
            <input
              type="file"
              className="form-control"
              id="extract-pdf"
              accept=".pdf"
              onChange={onFileSelected}
            />
          </motion.label>
        </div>
      </div>
      <div className="center mt-5">
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
      {pdfFileData && (
        <>
          <div className="col-lg-6  col-md-10 col-sm-12">
            <div className="my-5 d-flex  justify-content-around">
              <div className="row">
                <div className="d-flex col-lg-5 col-sm-12 my-2 center">
                  <label htmlFor="fromPage" className="dim fs-5 mx-3">
                    Start page:
                  </label>
                  <input
                    style={{ width: "5rem" }}
                    className="center bg-color shadow-in px-2 mx-2 form-control"
                    type="number"
                    id="fromPage"
                    min="1"
                    max={pdfPagesCount}
                  />
                </div>
                <div className="d-flex col-lg-5 col-sm-12 my-2 center">
                  <label htmlFor="toPage" className="dim fs-5 mx-3">
                    End page:
                  </label>
                  <input
                    style={{ width: "5rem" }}
                    className="center bg-color shadow-in px-2 mx-2 form-control"
                    type="number"
                    id="toPage"
                    min="1"
                    max={pdfPagesCount}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="my-5 row d-flex justify-content-center">
            <div className="col-lg-12  col-md-10 col-sm-12 d-flex justify-content-center">
              {pagesExtracted ? (
                <button
                  className="shadow-out shadow-btn dim p-2"
                  onClick={downloadPdf}
                >
                  Download
                </button>
              ) : (
                <button
                  className="shadow-out shadow-btn dim  p-2"
                  onClick={extractPdfPages}
                >
                  Extract Pages
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
