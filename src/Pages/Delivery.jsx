import React, { useState, useEffect } from "react";

import TotalPrices from "../delivery/Charges/TotalPrices";
import DeliveryHeader from "../delivery/components/DeliveryHeader";
import "../styles/delivery.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Framer Motion for cursor animation
import getToken from "../utils/getToken";
import { MoonLoader } from "react-spinners";
import * as pdfjsLibs from "pdfjs-dist/webpack";
import BindingCharges from "../delivery/Charges/BindingCharges";
import PaperCharges from "../delivery/Charges/PrintingCharges";

const Delivery = ({ scrollToTop }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState("");
  // ______ Per File Price ____
  // const [perFilePrice, setperFilePrice] = useState(0);
  // _____ Copies ____
  // const [copies, setCopies] = useState(1);
  //  __ Binding ___
  const [spiralBinding, setSpiralBinding] = useState(false);
  const [plasticCover, setPlasticCover] = useState(false);

  // _______Setup______
  const [singleSide, setSingleSide] = useState(true);
  const [bothside, setBothSide] = useState(false);

  // _____Colors____-
  const [color, setColor] = useState("bw");

  const [loading, setLoading] = useState(false);

  const [shop, setShop] = useState({});
  const token = getToken();
  const getShop = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/shop/details`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // "x-auth-token": localStorage.getItem("filedesk"),
        },
      }
    );
    const data = await res.json();
    if (data.error) {
      console.log(data.error);
    }
    setShop(data.msg);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    document.title = "FileDesk | Delivery";
    getShop();
  }, []);

  const handleFileChange = (e) => {
    const files = e.target.files;
    const fileArray = Array.from(files);
    const newFiles = {};

    fileArray.forEach((file) => {
      if (!file.name.endsWith(".pdf")) {
        // check if file is not a PDF
        setError("Please upload only PDF files"); // error message
        return;
      }
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const bufferArray = e.target.result;
        const uint8Array = new Uint8Array(bufferArray);
        const pdfDoc = pdfjsLibs.getDocument({ data: uint8Array });
        pdfDoc.promise.then((pdf) => {
          const pages = pdf._pdfInfo.numPages; // get number of pages
          pdf.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const canvasContext = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const renderContext = {
              canvasContext,
              viewport,
            };
            page.render(renderContext).promise.then(() => {
              const imageDataUri = canvas.toDataURL();
              const uId = Math.floor(Math.random() * 1000000000);

              newFiles[file.name] = {
                pages,
                imageDataUri,
                id: uId,
                filename: file.name,
                quantity: 1,
                spiralBind: false,
                plasticCover: false,
                singleSide: true,
                bothSide: false,
                color: false,
                blackandwhite: true,
              }; // add file name, number of pages, price, and image data URI to newFiles object
              setSelectedFiles((prev) => {
                return { ...prev, ...newFiles }; // merge newFiles with previously selected files
              });
              setTotalFiles(
                Object.keys(selectedFiles).length + Object.keys(newFiles).length
              ); // set total files count
            });
          });
        });
      };
    });
  };

  //  ----------- Delete the selected File-------------
  const handleDeleteFile = (name) => {
    const newFiles = { ...selectedFiles };
    delete newFiles[name];
    setSelectedFiles(newFiles);
    setTotalFiles(totalFiles - 1);
  };

  return (
    <>
      <section>
        {/* --------header---------- */}
        <DeliveryHeader />
        <motion.span
          whileHover={{ scale: 1.2 }}
          className="shadow-out arrowUp stroke pointer "
          onClick={scrollToTop}
        >
          <i className="fa fa-arrow-up " aria-hidden="true"></i>
        </motion.span>

        {/* ------------Main Delivery section---------- */}
        {loading && (
          <div className="center my-5 my-5">
            <MoonLoader color="#5b4af1" size={60} />
          </div>
        )}
        {shop?.orderAccepting ? (
          <div className="row mx-5 pop main_delivery_section">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="my-4 fw-bold jsf stroke ls-2 fw-light fs-3 center"
            >
              Order Document
            </motion.div>
            {/* -------Choose File----------- */}

            {token ? (
              <div className="col-lg-8 col-sm-12 px-5 Options">
                <div className="mx-4">
                  {totalFiles === 0 ? (
                    <motion.label
                      whileHover={{ scale: 1.2 }}
                      htmlFor="formFileLg"
                      className="u-f-b choosefile"
                    >
                      Upload Files
                      <input
                        multiple
                        className="form-control form-control-lg choosefile shadow-in hidden"
                        id="formFileLg"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                      />
                    </motion.label>
                  ) : null}
                  {error && (
                    <div className="container center py-5">
                      <span className="p-2 text-danger shadow-in">
                        {error}{" "}
                      </span>
                      <br />
                      <Link to="/tools" className="dim">
                        Convert to pdf ?
                      </Link>
                    </div>
                  )}

                  {/* Total Files Selected */}
                  <div className="my-4">
                    <span className="dim fs-5 ">
                      Total Files Selected: {totalFiles}
                    </span>
                  </div>
                  {/* ------------------------Main Content------------------- */}

                  <div>
                    {Object.entries(selectedFiles).map(
                      ([name, file], index) => (
                        <motion.div key={index} whileHover={{ scale: 1.05 }}>
                          {console.log(file)}
                          <motion.div
                            initial={{ x: "-100vw" }}
                            animate={{ x: 0 }}
                            transition={{
                              duration: 0.6,
                              type: "spring",
                              bounce: 0.5,
                              // damping: 5,
                            }}
                            className="my-5 row shadow-out py-3 deliveryCard"
                          >
                            <div className="col-lg-3 center">
                              {/* ------Thumbnail---------- */}
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                src={file.imageDataUri}
                                className="img-fluid pdfImg shadow-out p-1"
                                alt=""
                              />
                              {/* ---------Copies------ */}
                              <div className="copies d-flex">
                                <button
                                  onClick={() => {
                                    if (file.quantity > 1) {
                                      file.quantity--;
                                    }
                                    setSelectedFiles((prev) => {
                                      return {
                                        ...prev,
                                        [name]: {
                                          ...file,
                                          quantity: file.quantity,
                                        },
                                      };
                                    });
                                  }}
                                  className="center shadow-out "
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  value={file.quantity}
                                  disabled
                                  className="center shadow-in px-2 mx-2 form-control"
                                />
                                <button
                                  onClick={() => {
                                    file.quantity++;
                                    setSelectedFiles((prev) => {
                                      return {
                                        ...prev,
                                        [name]: {
                                          ...file,
                                          quantity: file.quantity,
                                        },
                                      };
                                    });
                                  }}
                                  className=" shadow-out"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="col-lg-7 py-3">
                              <h4 className="dim fs-5">
                                {name} (Pages: {file.pages})
                              </h4>
                              {/* ___Bind____ */}
                              <div className="d-flex my-3 row bind">
                                <div className="col-lg-3">
                                  <span className="fw-bold mx-4">
                                    Bindings:
                                  </span>
                                </div>
                                <div className="col-lg-9 d-flex">
                                  <div className="col-lg-5">
                                    <div className="form-check mx-3">
                                      <label className="form-check-label">
                                        <input
                                          onClick={() =>
                                            setSpiralBinding(!spiralBinding)
                                          }
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={file?.spiralBind}
                                          onChange={(e) => {
                                            const value = e.target.checked;
                                            setSelectedFiles((prev) => {
                                              return {
                                                ...prev,
                                                [name]: {
                                                  ...file,
                                                  spiralBind: value,
                                                  plasticCover: false,
                                                },
                                              };
                                            });
                                          }}
                                          id="spiralBinding"
                                        />
                                        Spiral Binding
                                      </label>
                                    </div>
                                  </div>
                                  <div className="col-lg-5">
                                    <div className="form-check mx-3">
                                      <input
                                        onClick={() =>
                                          setPlasticCover(!plasticCover)
                                        }
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={file?.plasticCover}
                                        onChange={(e) => {
                                          const value = e.target.checked;
                                          setSelectedFiles((prev) => {
                                            return {
                                              ...prev,
                                              [name]: {
                                                ...file,
                                                plasticCover: value,
                                                spiralBind: false,
                                              },
                                            };
                                          });
                                        }}
                                        id="plasticCover"
                                      />
                                      <label className="form-check-label">
                                        Plastic Cover
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* ___ Setup____ */}
                              <div className="d-flex my-3 setup row">
                                <div className="col-lg-3">
                                  <span className="fw-bold mx-4">Sides:</span>
                                </div>
                                <div className="col-lg-9 d-flex optionIcon">
                                  <div className="col-lg-5 ">
                                    <div className="form-check mx-3">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value=""
                                        onClick={() =>
                                          setSingleSide(!singleSide)
                                        }
                                        checked={file?.singleSide}
                                        onChange={(e) => {
                                          const value = e.target.checked;
                                          setSelectedFiles((prev) => {
                                            return {
                                              ...prev,
                                              [name]: {
                                                ...file,
                                                singleSide: value,
                                                bothSide: false,
                                              },
                                            };
                                          });
                                        }}
                                        id="ss"
                                      />
                                      <label className="form-check-label">
                                        Single Side
                                      </label>
                                    </div>
                                  </div>
                                  <div className="col-lg-5">
                                    <div className="form-check mx-3">
                                      <input
                                        onClick={() => setBothSide(!bothside)}
                                        checked={file?.bothSide}
                                        onChange={(e) => {
                                          const value = e.target.checked;
                                          setColor("bw");
                                          setSelectedFiles((prev) => {
                                            return {
                                              ...prev,
                                              [name]: {
                                                ...file,
                                                bothSide: value,
                                                singleSide: false,
                                                color: false,
                                                blackandwhite: true,
                                              },
                                            };
                                          });
                                        }}
                                        className="form-check-input"
                                        type="checkbox"
                                        value=""
                                        id="bs"
                                      />
                                      <label className="form-check-label">
                                        Both Side
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Colors */}
                              <div className="d-flex my-3 setup row">
                                <div className="col-lg-3">
                                  <span className="fw-bold mx-4">Colors:</span>
                                </div>
                                <div className="col-lg-9 d-flex ">
                                  <div
                                    className={`bwBox tt mx-4 ${
                                      color === "bw" ? "active" : ""
                                    }`}
                                    data-tooltip="Black and White"
                                    onClick={(e) => {
                                      setColor("bw");
                                      // const value = e.target.value;

                                      setSelectedFiles((prev) => {
                                        return {
                                          ...prev,
                                          [name]: {
                                            ...file,
                                            blackandwhite: true,
                                            color: false,
                                          },
                                        };
                                      });
                                    }}
                                  ></div>
                                  <div
                                    className={`colorBox tt mx-4 ${
                                      color === "color" ? "active" : ""
                                    }`}
                                    data-tooltip="Coloured"
                                    onClick={(e) => {
                                      setColor("color");

                                      setSelectedFiles((prev) => {
                                        return {
                                          ...prev,
                                          [name]: {
                                            ...file,
                                            color: true,
                                            bothSide: false,
                                            singleSide: true,
                                            blackandwhite: false,
                                          },
                                        };
                                      });
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            {/* ------Delete Icon -------*/}
                            <div className="col-lg-2 py-4 deleteIcon">
                              <button className="shadow-out my-1 trash shadow-btn text-danger px-2 center ">
                                <i
                                  className="fa fa-trash "
                                  aria-hidden="true"
                                  onClick={() =>
                                    handleDeleteFile(name, file.price)
                                  }
                                ></i>
                              </button>
                              {/* ------------- SingleSide Pdf Price------- */}
                              <div className="position-absolute  bottom-0 filePrice pb-5 mb-2">
                                <i className="fas stroke p-1 fa-inr"></i>
                                <span className="dim">{file.pages * 1.5}</span>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    )}
                  </div>

                  {/* -----------Upload More----------- */}
                  {totalFiles > 0 ? (
                    <div className="container center py-5">
                      <motion.label
                        whileHover={{ scale: 1.2 }}
                        htmlFor="formFileLg"
                        className="u-f-b choosefile"
                      >
                        Upload More?
                        <input
                          multiple
                          className="form-control form-control-lg choosefile shadow-in hidden"
                          id="formFileLg"
                          type="file"
                          onChange={handleFileChange}
                        />
                      </motion.label>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mx-4">
                <Link
                  to={"/auth"}
                  whileHover={{ scale: 1.2 }}
                  htmlFor="formFileLg"
                  className="u-f-b choosefile"
                >
                  Login to Upload
                </Link>
              </div>
            )}

            {/*  ----------- Prices Chart------------ */}
            {token && (
              <>
                <div className="col-lg-4 col-sm-12 jsf my-5 price_chart">
                  <h2 className="text-center  ls-2 fw-bold stroke pop">
                    Prices Chart
                  </h2>
                  {shop?.spiralPrice}

                  <BindingCharges
                    spiral={shop?.spiralPrice}
                    cover={shop?.coverPrice}
                  />
                  <PaperCharges
                    bwSingle={shop?.bwSingle}
                    bwDouble={shop?.bwDouble}
                    color={shop?.colorPrice}
                  />
                </div>
                <TotalPrices />
              </>
            )}
          </div>
        ) : (
          !loading && (
            <>
              <div className="container center py-5">
                <p className="fs-3 py-5 px-4 text-danger center">
                  Sorry! We are not accepting orders right now.
                </p>
              </div>
            </>
          )
        )}
      </section>
    </>
  );
};

export default Delivery;
