import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DeliveryHeader from "../delivery/components/DeliveryHeader";
import "../styles/delivery.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Framer Motion for cursor animation
import getToken from "../utils/getToken";
import { HashLoader } from "react-spinners";
import * as pdfjsLibs from "pdfjs-dist/webpack";
import BindingCharges from "../delivery/Charges/BindingCharges";
import PaperCharges from "../delivery/Charges/PrintingCharges";
import Footer from "../components/Footer";

const Delivery = ({ scrollToTop }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  //  _ _ _ _ _ For the array of files _ _ _  _ _ _ _  _
  const [selectedFilesArray, setSelectedFilesArray] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState("");
  const [showThumbail, setshowThumbail] = useState(false);
  // _______ Delivery Options _______
  const [deliveryOptions, setDeliveryOptions] = useState({
    standard: true,
    fast: false,
  });
  const [totalPages, setTotalPages] = useState(0);
  // ______ Total Price ____
  const [totalPrice, setTotalPrice] = useState(0);
  const [subTotalPrice, setSubTotalPrice] = useState(0);
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
    setLoading(true);
    const res = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/shop/details`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    setLoading(false);
    const data = await res.json();
    if (data.error) {
      console.log(data.error);
    }
    setShop(data.msg);
  };
  // __________ On File change __________
  const handleFileChange = (e) => {
    const files = e.target.files;
    const fileArray = Array.from(files);
    const newFiles = {};

    // ______ it is only the array of files _____
    setSelectedFilesArray([...selectedFilesArray, ...fileArray]);

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
                price: pages * shop?.bwSingle,
              }; // add file name, number of pages, price, and image data URI to newFiles object

              setSelectedFiles(
                (prev) => {
                  return { ...prev, ...newFiles }; // merge newFiles with previously selected files
                },
                () => {
                  //callback function to update price or value immediately
                  const updatedFiles = { ...selectedFiles, ...newFiles };
                  updatedFiles.price = calculatePrice(updatedFiles);

                  setSelectedFiles((prev) => {
                    return { ...prev, ...updatedFiles };
                  }); // merge newFiles with previously selected files))
                }
              );

              setTotalFiles(
                Object.keys(selectedFiles).length + Object.keys(newFiles).length
              ); // set total files count
            });
          });
        });
      };
    });
  };
  //  __________ Delete the selected File __________
  const handleDeleteFile = (name) => {
    const newFiles = { ...selectedFiles };
    delete newFiles[name];
    setSelectedFiles(newFiles);
    // for only the array of files
    const newFilesArray = [...selectedFilesArray];
    newFilesArray.splice(newFilesArray.indexOf(name), 1);
    setSelectedFilesArray(newFilesArray);
    //total files
    setTotalFiles(totalFiles - 1);
    toast.success(`${name} deleted successfully`);
  };
  //  __________ Delete All Files  __________
  const DeleteAllFiles = () => {
    setSelectedFiles({});
    setSelectedFilesArray([]);
    setTotalFiles(0);
    toast.success(`All files deleted successfully`);
  };
  //  __________ Price Calculation __________
  const calculatePrice = (file) => {
    if (file.color) {
      return (
        file.quantity * file.pages * shop?.colorPrice +
        (file.spiralBind && shop?.spiralPrice * file.quantity) +
        (file.plasticCover && shop?.coverPrice * file.quantity)
      );
    } else {
      return (
        file.quantity *
          file.pages *
          (file.bothSide ? shop?.bwDouble / 2 : shop?.bwSingle) +
        (file.spiralBind && shop?.spiralPrice) +
        (file.plasticCover && shop?.coverPrice)
      );
    }
  };
  useEffect(() => {
    // scrollToTop();
    document.title = "FileDesk | Delivery";
    getShop();
  }, []);

  useEffect(() => {
    let totalPrice = 0;
    let totalPages = 0;
    for (const file of Object.values(selectedFiles)) {
      totalPrice += calculatePrice(file);
      totalPages += file.pages;
    }
    setTotalPages(totalPages);
    setSubTotalPrice(totalPrice);
    if (deliveryOptions.standard) {
      totalPrice === 0 ? (totalPrice = 0) : (totalPrice += shop?.deliveryPrice);
    }
    if (deliveryOptions.fast) {
      totalPrice === 0
        ? (totalPrice = 0)
        : (totalPrice += shop?.fastDeliveryPrice);
    }
    setTotalPrice(totalPrice);
    console.log("___ All Files Array___");
    console.log(selectedFilesArray);
  }, [selectedFiles, deliveryOptions]);

  return (
    <>
      <section>
        {/* --------header---------- */}
        <DeliveryHeader />
        <motion.span
          whileHover={{ scale: 1.1 }}
          className=" text-danger pricearrowUp  p-2 d-flex align-items-center pointer "
        >
          <i className="fas p-1 fa-inr"></i>
          <span className="fw-bold ">{subTotalPrice}</span>
        </motion.span>
        <motion.span
          whileHover={{ scale: 1.1 }}
          className="shadow-out arrowUp  p-2 d-flex align-items-center pointer "
          onClick={scrollToTop}
        >
          <i class="fa-solid fa-arrow-up fs-5 px-2 py-1 stroke"></i>
        </motion.span>

        {/* ------------Main Delivery section---------- */}
        {loading && (
          <div className="center">
            <HashLoader color="#5b4af1" size={60} />
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
                <div className="mx-4 margin-0">
                  {totalFiles === 0 ? (
                    <motion.label
                      whileHover={{ scale: 1.2 }}
                      htmlFor="formFileLg"
                      className="u-f-b choosefile d-flex align-items-center justify-content-around"
                    >
                      <lord-icon
                        src="https://cdn.lordicon.com/wfadduyp.json"
                        trigger="loop"
                        colors="primary:white"
                        style={{ width: "33px" }}
                      ></lord-icon>
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
                  <div className="my-4 d-flex justify-content-between">
                    <span className="dim fs-5 ">
                      {window.screen.width < 500
                        ? "Total Files"
                        : "Total Files Selected"}
                      : {totalFiles}
                    </span>
                    {totalFiles > 0 && (
                      <span
                        onClick={DeleteAllFiles}
                        className="pointer text-danger btn mx-4 p-2 deleteAll"
                      >
                        Delete All
                      </span>
                    )}
                  </div>
                  {/* ------------------------Main Content------------------- */}

                  <div>
                    {Object.entries(selectedFiles).map(
                      ([name, file], index) => (
                        <motion.div key={index}>
                          {console.log(file)}
                          <motion.div
                            data-aos="zoom-in"
                            whileHover={{ scale: 1.05 }}
                            className="my-5 row shadow-out py-3 deliveryCard"
                          >
                            <div className="col-lg-3 center">
                              {window.screen.width < 500 ? (
                                <i
                                  className={`fa-solid fa-eye my-2 pointer fs-3 ${
                                    showThumbail ? "dim" : ""
                                  }`}
                                  onClick={() => setshowThumbail(!showThumbail)}
                                ></i>
                              ) : (
                                <motion.img
                                  whileHover={{ scale: 1.03 }}
                                  src={file.imageDataUri}
                                  className={`img-fluid pdfImg shadow-out p-1`}
                                  alt=""
                                />
                              )}
                              {/* ------Thumbnail---------- */}
                              {showThumbail && (
                                <motion.img
                                  whileHover={{ scale: 1.03 }}
                                  src={file.imageDataUri}
                                  className={`img-fluid pdfImg shadow-out p-1`}
                                  alt=""
                                />
                              )}
                              {/* ---------Copies------ */}
                              <div className="copies d-flex">
                                <button
                                  onClick={() => {
                                    if (file.quantity > 1) {
                                      file.quantity--;
                                      file.price = calculatePrice(file);
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
                                  className="center fw-bolder shadow-out "
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  value={file.quantity}
                                  disabled
                                  className="text-center shadow-in bg-color px-2 mx-2 form-control"
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
                                          price: calculatePrice(file),
                                        },
                                      };
                                    });
                                  }}
                                  className=" shadow-out center fw-bolder"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="col-lg-7 py-3">
                              <h4
                                className={`dim fs-5 d-flex ${
                                  window.screen.width < 500
                                    ? " justify-content-center "
                                    : ""
                                } `}
                              >
                                {name}{" "}
                                <span className="text-danger mx-2">
                                  {" "}
                                  (
                                  <span className="dim">
                                    Pages: {file.pages}
                                  </span>
                                  )
                                </span>
                              </h4>
                              {/* ___Bind____ */}
                              <div className="d-flex my-3 row bind">
                                <div className="col-lg-3">
                                  <span className="fw-bold dim mx-4">
                                    Bindings:
                                  </span>
                                </div>
                                <div className="col-lg-9 d-flex justify-content-around">
                                  <div className="col-lg-5">
                                    <div className="form-check margin-0 mx-3">
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
                                              const updatedFile = {
                                                ...prev[name],
                                                spiralBind: value,
                                                plasticCover: false,
                                                price: calculatePrice({
                                                  ...prev[name],
                                                  spiralBind: value,
                                                  plasticCover: false,
                                                }),
                                              };
                                              return {
                                                ...prev,
                                                [name]: updatedFile,
                                              };
                                            });
                                          }}
                                          id="spiralBinding"
                                        />
                                        Spiral Bind
                                      </label>
                                    </div>
                                  </div>
                                  <div className="col-lg-5">
                                    <div className="form-check margin-0 mx-3">
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
                                            const updatedFile = {
                                              ...prev[name],
                                              plasticCover: value,
                                              spiralBind: false,
                                              price: calculatePrice({
                                                ...prev[name],
                                                plasticCover: value,
                                                spiralBind: false,
                                              }),
                                            };
                                            return {
                                              ...prev,
                                              [name]: updatedFile,
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
                                  <span className="fw-bold dim mx-4">
                                    Sides:
                                  </span>
                                </div>
                                <div className="col-lg-9 d-flex optionIcon justify-content-around">
                                  <div className="col-lg-5 ">
                                    <div className="form-check margin-0 mx-3">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value=""
                                        onClick={() => {
                                          setSingleSide(!singleSide);
                                          setBothSide(!singleSide);
                                        }}
                                        checked={file?.singleSide}
                                        onChange={(e) => {
                                          const value = e.target.checked;
                                          setSelectedFiles((prev) => {
                                            const updatedFile = {
                                              ...prev[name],
                                              singleSide: value,
                                              bothSide: !value,
                                              color: false,
                                              blackandwhite: true,
                                              price: calculatePrice({
                                                ...prev[name],
                                                singleSide: value,
                                                bothSide: !value,
                                                color: false,
                                                blackandwhite: true,
                                              }),
                                            };
                                            return {
                                              ...prev,
                                              [name]: updatedFile,
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
                                    <div className="form-check mx-3 margin-0">
                                      <input
                                        onClick={() => {
                                          setBothSide(!bothside);
                                          setSingleSide(!bothside);
                                          setColor("bw");
                                        }}
                                        checked={file?.bothSide}
                                        onChange={(e) => {
                                          const value = e.target.checked;
                                          setColor("bw");
                                          setSelectedFiles((prev) => {
                                            const updatedFile = {
                                              ...prev[name],
                                              bothSide: value,
                                              singleSide: !value,
                                              color: false,
                                              blackandwhite: true,
                                              price: calculatePrice({
                                                ...prev[name],
                                                bothSide: value,
                                                singleSide: !value,
                                                color: false,
                                                blackandwhite: true,
                                              }),
                                            };
                                            return {
                                              ...prev,
                                              [name]: updatedFile,
                                            };
                                          });
                                        }}
                                        className="form-check-input"
                                        type="checkbox"
                                        value=""
                                        id="bs"
                                        disabled={file.color}
                                      />
                                      <label className="form-check-label">
                                        Both Side
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Colors */}
                              <div className="d-flex my-3 color  row align-items-center">
                                <div className="col-lg-3">
                                  <span className="fw-bold dim mx-4">
                                    Colors:
                                  </span>
                                </div>
                                <div className="col-lg-9 my-3 d-flex justify-content-around ">
                                  <div
                                    className={`bwBox tt mx-4 ${
                                      file.blackandwhite ? "active" : ""
                                    }`}
                                    data-tooltip="Black and White"
                                    onClick={(e) => {
                                      setColor("bw");
                                      setSelectedFiles((prev) => {
                                        const updatedFile = {
                                          ...prev[name],
                                          color: false,
                                          blackandwhite: true,
                                          price: calculatePrice({
                                            ...prev[name],
                                            color: false,
                                            blackandwhite: true,
                                          }),
                                        };
                                        return {
                                          ...prev,
                                          [name]: updatedFile,
                                        };
                                      });
                                    }}
                                  ></div>
                                  <div
                                    className={`colorBox tt mx-4 ${
                                      file.color ? "active" : ""
                                    }`}
                                    disabled={file.bothSide}
                                    data-tooltip="Coloured"
                                    onClick={(e) => {
                                      setColor("color");
                                      setBothSide(false);
                                      setSelectedFiles((prev) => {
                                        const updatedFile = {
                                          ...prev[name],
                                          bothSide: false,
                                          color: true,
                                          blackandwhite: false,
                                          singleSide: true,
                                          price: calculatePrice({
                                            ...prev[name],
                                            bothSide: false,
                                            blackandwhite: false,
                                            color: true,
                                            singleSide: true,
                                          }),
                                        };
                                        return {
                                          ...prev,
                                          [name]: updatedFile,
                                        };
                                      });
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            {/* ------Delete Icon -------*/}
                            <div className="col-lg-2 py-4 position-relative   deleteIcon">
                              <button
                                className="shadow-out my-1 trash shadow-btn text-danger px-2 center
                               "
                                onClick={() =>
                                  handleDeleteFile(name, file.price)
                                }
                              >
                                <i className="fa-solid fa-trash  fa-shake fs-5"></i>
                              </button>
                              {/* ------------- Single Pdf Price------- */}
                              <div className="position-absolute fileprice  bottom-0 filePrice pb-5 mb-2">
                                <i className="fas stroke p-1 fa-inr"></i>
                                <span className="dim">{file?.price}</span>
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
                        className="u-f-b  d-flex align-items-center justify-content-around"
                        style={{ width: "11rem" }}
                      >
                        <lord-icon
                          src="https://cdn.lordicon.com/wfadduyp.json"
                          trigger="loop"
                          colors="primary:white"
                          style={{ width: "33px" }}
                        ></lord-icon>
                        Upload More?
                        <input
                          multiple
                          className="form-control form-control-lg  shadow-in hidden"
                          id="formFileLg"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf"
                        />
                      </motion.label>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="ms-4 ps-5 ">
                <Link
                  to={"/auth"}
                  whileHover={{ scale: 1.2 }}
                  htmlFor="formFileLg"
                  className="u-f-b choosefile "
                >
                  <i className="fas fa-sign-in-alt  p-2"></i>
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

                {/* _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _  */}

                <div className="container  my-4">
                  <div className="row  justify-content-evenly ">
                    {/* _________ Address Details ________ */}
                    <div className="col-lg-6 shadow-out radius-1 col-sm-12 p-3 addressDetails">
                      <form>
                        <span className="dim fs-5 mx-3 d-flex align-items-center">
                          Enter your Address{" "}
                          <lord-icon
                            src="https://cdn.lordicon.com/oaflahpk.json"
                            trigger="loop"
                            colors="primary:#5b4af1"
                            style={{ width: "40px" }}
                          ></lord-icon>
                        </span>
                        <hr className="dim fs-4" style={{ height: "1.2px" }} />
                        <div className="d-flex row mx-2 my-4 ">
                          <div className="col-lg-6 my-2 col-sm-12">
                            <label
                              className=" my-2 position-relative d-flex justify-content-around"
                              htmlFor="name"
                            >
                              <input
                                type="text"
                                id="name"
                                placeholder=" "
                                className="addressInput mx-1 shadow-out"
                              />
                              <span className="placeholder">Name</span>
                            </label>
                          </div>
                          <div className="col-lg-6 my-2 col-sm-12">
                            <label
                              className="my-2 position-relative d-flex justify-content-around"
                              htmlFor="phone"
                            >
                              <input
                                id="phone"
                                type="text"
                                placeholder=" "
                                className="addressInput mx-1 shadow-out"
                              />
                              <span className="placeholder">Phone no</span>
                            </label>
                          </div>
                        </div>
                        <div className="col-lg-12  col-sm-12 my-2 center">
                          <select
                            className="bg-color blocks pointer shadow-out p-2"
                            name=""
                            id=""
                            required
                            style={{ width: "50%" }}
                          >
                            <option value="none">Select Block</option>
                            <option value="Block 1">Block 1</option>
                            <option value="Block 2">Block 2</option>
                            <option value="Block 3">Block 3</option>
                            <option value="Block 4">Block 4</option>
                            <option value="Block 5">Block 5</option>
                            <option value="Block 6">Block 6</option>
                            <option value="Block 7">Block 7</option>
                            <option value="Block 8">Block 8</option>
                            <option value="Block 9">Block 9</option>
                            <option value="Block 10">Block 10</option>
                          </select>
                        </div>
                        <div className="col-lg-12 col-sm-12 center position-relative my-4">
                          <textarea
                            name="address"
                            id="address"
                            className="addressTextarea mx-2 shadow-out"
                            placeholder=" "
                            style={{ width: "93%" }}
                            rows="5"
                          ></textarea>
                          <span className="placeholder">Address</span>
                        </div>
                      </form>
                    </div>
                    {/* ____________ Price Details _________ */}

                    <div className="col-lg-5  col-sm-12 shadow-out radius-1 px-3 py-3">
                      <table className="table">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="dim fs-5 d-flex align-items-center"
                            >
                              Price Details
                              <lord-icon
                                src="https://cdn.lordicon.com/pmegrqxm.json"
                                trigger="loop"
                                colors="primary:#5b4af1"
                                style={{ width: "27px", marginLeft: ".5rem" }}
                              ></lord-icon>
                            </th>
                            <th scope="col" className="dim"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Subtotal ({totalFiles} Files)</td>
                            <td className="dim fs-5 jsf">₹ {subTotalPrice}</td>
                          </tr>
                          <tr>
                            <td>Standard Delivery</td>
                            <td>₹ {shop?.deliveryPrice}</td>
                          </tr>
                          <tr>
                            <td> Fast Delivery</td>
                            <td> ₹ {shop?.fastDeliveryPrice}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="d-flex justify-content-around mt-3">
                        <div className="d-flex">
                          <input
                            type="checkbox"
                            name="standard"
                            checked={deliveryOptions.standard}
                            className="form-check-input mx-2"
                            onChange={(e) => {
                              const value = e.target.checked;
                              setDeliveryOptions((prev) => {
                                return {
                                  ...prev,
                                  fast: !value,
                                  standard: value,
                                };
                              });
                            }}
                          />
                          Standard Delivery
                        </div>
                        <div className="dim d-flex">
                          <input
                            type="checkbox"
                            name="fast"
                            checked={deliveryOptions.fast}
                            className="form-check-input mx-2"
                            onChange={(e) => {
                              const value = e.target.checked;
                              setDeliveryOptions((prev) => {
                                return {
                                  ...prev,
                                  fast: value,
                                  standard: !value,
                                };
                              });
                            }}
                          />
                          <div className="d-flex align-items-center">
                            Fast Delivery
                            <i class="fa-solid dim p-2 fa-rocket fs-4 fa-beat"></i>
                          </div>
                        </div>
                      </div>
                      <hr className="dim" />
                      <div className="d-flex fs-5 justify-content-between my-3">
                        <div className="dim mx-3">Total Amount</div>
                        <div className="dim me-5">₹ {totalPrice}</div>
                      </div>
                      <hr className="dim" />
                      <div className="center mt-4 ">
                        {totalPrice > 0 && totalPrice < 50 ? (
                          <p className="center text-danger d-flex px-2 ">
                            You have to shop for more than ₹50 to place this
                            order
                          </p>
                        ) : null}
                        <button
                          disabled={totalPrice < 50}
                          onClick={() => {
                            toast.success("Order Placed Successfully");
                          }}
                          className="shadow-btn shadow-out dim fw-bold"
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
        <Footer />
      </section>
    </>
  );
};

export default Delivery;
