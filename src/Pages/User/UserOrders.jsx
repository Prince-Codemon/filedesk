import React, { useEffect, useState } from "react";
import getToken from "../../utils/getToken";
import moment from "moment";
import { HashLoader } from "react-spinners";
import { toast } from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModalIndex, setShowModalIndex] = useState(null);

  const token = getToken();
  const fetchOrders = async () => {
    setLoading(true);
    const data = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/userorders`, // /api/userorders for getting orders of users
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Secret-Key": `${process.env.REACT_APP_SECRET_KEY}`,
        },
      }
    );
    const res = await data.json();
    setLoading(false);
    // console.log(res);
    if (res?.orders) {
      setOrders(res?.orders);
    }
  };
  useEffect(() => {
    document.title = "FileDesk | Dashboard | Orders";
    fetchOrders();
  }, []);
  // console.log("----->", orders);

  const Modal = ({ order }) => {
    return (
      <div className="modal">
        <p>Total Files: {order.orderTotalFiles}</p>
        <p>Total Price: {order.orderTotal}</p>
      </div>
    );
  };

  return (
    <div className="container adminorders my-5">
      <h4 className="center fs-3 ls-2 stroke my-4">Your Orders</h4>

      {orders.length > 0 ? (
        <>
          <div className="row d-flex justify-content-around">
            {orders.map((order, i) => {
              return (
                <div key={i} className="col-lg-5 col-sm-12">
                  <div
                    onClick={() => setShowModalIndex(i)}
                    className={`card my-4 ${
                      window.screen.width < 500 ? "ps-1" : "ps-4 "
                    } py-2 bg-color border-none shadow-out pointer shadow-btn`}
                    key={i}
                  >
                    <div className="time row my-1 justify-content-around">
                      <div className="text-secondary col-4">
                        {moment(order?.createdAt).fromNow()}
                      </div>
                      <div className="col-5 col-sm-6 center">
                        Total Files: {order?.orderTotalFiles}
                      </div>
                      <div className="col-2 center">
                        <i className="fa-solid fa-greater-than  dim"></i>
                      </div>
                    </div>
                    <hr />
                    <div className="row my-2 justify-content-between">
                      <div className="col-4 text-capitalize ms-3">
                        {order?.deliveryType}
                      </div>
                      <div className="col-5 d-flex ">
                        Price : &nbsp;<i className="fa-solid fa-inr center"></i>
                        &nbsp;
                        {" " + order?.orderTotal}
                      </div>
                    </div>
                    <hr />
                    <div className="row my-2">
                      <div className="col-9 d-flex flex-column align-items-center flex-start">
                        <p className="text-muted my-2 ">
                          {" " + order?.orderId}
                        </p>
                        <p className="text-muted my-2 text-start ">
                          {" " + order?.orderPaymentId}
                        </p>
                      </div>
                      <div className="col-2 d-flex flex-column align-items-center">
                        <button
                          title="Copy Order ID"
                          className={`border-none my-1 ${
                            window.screen.width < 500 ? "ms-1" : "mx-3"
                          }  shadow-btn copy roundedBorder`}
                          onClick={() => {
                            navigator.clipboard.writeText(order?.orderId);
                            toast.success("Order ID Copied");
                          }}
                        >
                          <i className="fa-solid fa-clipboard dim"></i>
                        </button>
                        <button
                          title="Copy Payment ID"
                          className={`border-none ${
                            window.screen.width < 500 ? "ms-1" : "mx-3"
                          }  shadow-btn copy roundedBorder`}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              order?.orderPaymentId
                            );
                            toast.success("Payment ID Copied");
                          }}
                        >
                          <i className="fa-solid fa-clipboard dim"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* -----------Modal -------------- */}
          {showModalIndex !== null && (
            <div className="modal_wrapper">
              {console.log(orders[showModalIndex])}
              <div className="modal_content">
                <div className="modal_header my-2 row justify-content-between align-items-center">
                  <div className="col-5">
                    <h4 className="dim fs-5 fw-bold">Order Details</h4>
                  </div>
                  <div className="col-3 col-sm-5">
                    {orders[showModalIndex]?.orderStatus === 0 ? (
                      <span className="text-success">
                        <i className="fa-solid fa-circle-check fa-beat mx-2"></i>
                        <span className="">Order Placed</span>
                      </span>
                    ) : orders[showModalIndex]?.orderStatus === 1 ? (
                      <span className="text-success">
                        <i className="fa-solid fa-spinner fa-spin-pulse  mx-2"></i>
                        <span className="">In Progress</span>
                      </span>
                    ) : orders[showModalIndex]?.orderStatus === 2 ? (
                      <span className="text-success">
                        <i className="fa-solid fa-truck mx-2 fa-fade"></i>
                        Out for Delivery
                      </span>
                    ) : orders[showModalIndex]?.orderStatus === 3 ? (
                      <>
                        <span className=" text-success">
                          <i className="fa-solid fa-circle-check mx-2"></i>
                          Delivered
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className="col-2 center">
                    <button
                      onClick={() => setShowModalIndex(null)}
                      className="shadow-btn "
                    >
                      <i className="fa-solid fs-4 fa-times dim fw-bold "></i>
                    </button>
                  </div>
                </div>
                <hr />
                <div className="modal_body">
                  <div className="row">
                    <div className="col-6">
                      <p>
                        Total Files: {orders[showModalIndex].orderTotalFiles}
                      </p>
                    </div>
                    <div className="col-6">
                      <p>Total Price: {orders[showModalIndex].orderTotal}</p>
                    </div>
                  </div>
                  {/* Order Options */}
                  <div className=" shadow-in file_container center">
                    <table className="table">
                      <thead>
                        <tr className="dim">
                          <th scope="col">#</th>
                          <th scope="col">FileName</th>
                        </tr>
                      </thead>
                      {orders[showModalIndex].orderItems.map((item, i) => {
                        return (
                          <tbody key={i}>
                            <tr>
                              <th scope="row">{i + 1}</th>

                              <td data-cell={`File ${i + 1}`} className="mt-2">
                                {item.filename + "   (" + item.pages + ") "}
                              </td>
                            </tr>
                          </tbody>
                        );
                      })}
                    </table>
                  </div>
                  {/* ------Address------ */}
                  <hr />
                  <div className="center user_address">
                    <table className="table">
                      <thead>
                        <tr className="dim">
                          <th scope="col">Name</th>
                          <th scope="col">Address</th>
                          <th scope="col">Block</th>
                          <th scope="col">Phone No</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-cell="Name">
                            {orders[showModalIndex]?.orderAddress.name}
                          </td>
                          <td data-cell="Address">
                            {orders[showModalIndex]?.orderAddress.address}
                          </td>
                          <td data-cell="block">
                            {orders[showModalIndex]?.orderAddress.block}
                          </td>
                          <td data-cell="phone no">
                            {orders[showModalIndex]?.orderAddress.phone}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : loading ? (
        <div className="center" style={{ height: "50vh" }}>
          <HashLoader color="#5b4af1" size={70} />
        </div>
      ) : (
        <div className="col-lg-6">
          <h4 className="dim center fs-4">Orders</h4>
          <div className="card my-1">
            <div className="card-body">
              <h5 className="card-title">No Orders</h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
