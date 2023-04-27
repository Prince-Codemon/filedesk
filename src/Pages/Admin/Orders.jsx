import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
import getToken from "../../utils/getToken";
import { HashLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import moment from "moment";

const Orders = () => {
  const [orders, setOrders] = useState([{ dropdownOpen: false }]);
  const [mainOrders, setMainOrders] = useState();
  const [loading, setloading] = useState(false);
  const [deleteloading, setdeleteloading] = useState(false);
  const [loadingstatus, setloadingstatus] = useState(false);
  const token = getToken();
  const fetchOrders = async () => {
    setloading(true);
    const data = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/adminorders`, // /api/userorders for getting orders of users
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Secret-Key": `${process.env.REACT_APP_SECRET_KEY}`,
        },
      }
    );

    setloading(false);
    const res = await data.json();
    // console.log(res);
    if (res?.orders) {
      setOrders(res?.orders);
      setMainOrders(res?.orders);
    }
  };
  const updateStatus = async (id) => {
    setloadingstatus(true);
    const data = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/updateStatus/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Secret-Key": `${process.env.REACT_APP_SECRET_KEY}`,
        },
      }
    );
    const res = await data.json();
    // console.log("status", res);
    setloadingstatus(false);
    if (res?.message) {
      toast.success(res?.message);
      const newOrders = orders.map((order) => {
        if (order._id === id) {
          return { ...order, orderStatus: order.orderStatus + 1 };
        }
        return order;
      });
      setOrders(newOrders);
      setMainOrders(newOrders);
    } else {
      toast.error(res?.error ? res.error : res?.message);
    }
  };

  const deleteOrder = async (orderId) => {
    setdeleteloading(true);
    const data = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/deleteorder/${orderId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Secret-Key": `${process.env.REACT_APP_SECRET_KEY}`,
        },
      }
    );
    const res = await data.json();
    setdeleteloading(false);
    if (res?.message) {
      toast.success(res?.message);
      fetchOrders();
    } else {
      toast.error(res?.message);
    }
  };
  useEffect(() => {
    document.title = "FileDesk | Dashboard | Orders";
    fetchOrders();
  }, []);

  return (
    <div className="container adminorders my-1">
      <div className="row center">
        <Dashboard />
        <div className="row d-flex align-items-center justify-content-around">
          <div className="col-4">
            <h4 className="center fs-3 dim my-4 fw-bold">All Orders</h4>
          </div>
          {/* -------Fiter Order---------- */}
          <div className="col-4">
            <div className="row">
              <select
                className="form-select bg-color"
                name="delivery type"
                id=""
                defaultValue={"all"}
                onChange={(e) => {
                  const filter = e.target.value;
                  // console.log(filter);

                  if (filter === "all") {
                    setOrders(mainOrders);
                  } else {
                    // console.log(mainOrders);
                    const filtered = mainOrders.filter(
                      (order) =>
                        order.deliveryType === filter ||
                        order.orderStatus === parseInt(filter)
                    );
                    setOrders(filtered);
                  }
                }}
              >
                <option value="all">All</option>
                <option value="standard">Standard</option>
                <option value="fast">Fast</option>
                <option value="0">New Order</option>
                <option value="1">In Progress</option>
                <option value="2">Out for Delivery</option>
                <option value="3">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length > 0 ? (
          <>
            <div className="row center">
              {orders.map((order, i) => {
                return (
                  <div key={i} className="col-lg-10 col-sm-12">
                    <div
                      className={`card my-4 ${
                        window.screen.width < 500 ? "ps-1" : "ps-4 "
                      } py-2 bg-color border-none ${
                        loading ? "" : "shadow-out"
                      } `}
                      key={i}
                    >
                      <div className="card-body position-relative">
                        {loading ? (
                          <div className="center" style={{ height: "20vh" }}>
                            <HashLoader color="#5b4af1" size={70} />
                          </div>
                        ) : (
                          <>
                            <div className="card-text ">
                              <div className="row align-items-center">
                                <div className="col-lg-2">
                                  <span
                                    style={{ textTransform: "capitalize" }}
                                    className={`${
                                      order?.deliveryType === "standard"
                                        ? "text-dark"
                                        : "text-danger"
                                    } `}
                                  >
                                    {order?.deliveryType}
                                  </span>
                                </div>
                                <div className="col-lg-2 time">
                                  <span className="text-secondary">
                                    {moment(order?.createdAt).fromNow()}
                                  </span>
                                </div>
                                <div className="col-lg-1 totalprice">
                                  <span className="dim">
                                    <i className="fa-solid fa-inr mx-1"></i>
                                    {order?.orderTotal}
                                  </span>
                                </div>
                                <div className="col-lg-3 d-flex status justify-content-between align-items-center">
                                  <p className="card-text mb-0">
                                    {order?.orderStatus === 0 ? (
                                      <span className="text-success">
                                        <i className="fa-solid fa-circle-check fa-beat mx-2"></i>
                                        <span className="">New Order</span>
                                      </span>
                                    ) : order?.orderStatus === 1 ? (
                                      <span className="text-success">
                                        <i className="fa-solid fa-spinner fa-spin-pulse  mx-2"></i>
                                        <span className="">In Progress</span>
                                      </span>
                                    ) : order?.orderStatus === 2 ? (
                                      <span className="text-success">
                                        <i className="fa-solid fa-truck mx-2 fa-fade"></i>
                                        Out for Delivery
                                      </span>
                                    ) : order?.orderStatus === 3 ? (
                                      <>
                                        <span className=" text-success">
                                          <i className="fa-solid fa-circle-check mx-2"></i>
                                          Delivered
                                        </span>
                                      </>
                                    ) : null}
                                  </p>
                                  <button
                                    disabled={
                                      order?.orderStatus === 3 ? true : false
                                    }
                                    onClick={() => updateStatus(order?._id)}
                                    title="Update Status"
                                    className="me-2 ms-3 center shadow-btn shadow-out"
                                  >
                                    <i
                                      className={`fa-solid ${
                                        loadingstatus
                                          ? "fa-spinner fa-spin-pulse"
                                          : "fa-chevron-up"
                                      } `}
                                    ></i>
                                  </button>
                                </div>
                                {/* ------Delete File ------ */}
                                {order?.orderStatus === 3 ||
                                order?.orderPaymentId === null ? (
                                  <div className="col-lg-1">
                                    <button
                                      title="Delete Order"
                                      onClick={() =>
                                        deleteOrder(order?.orderId)
                                      }
                                      className="shadow-btn mx-2 shadow-out"
                                    >
                                      {deleteloading ? (
                                        "deleting..."
                                      ) : (
                                        <i className="fa-solid fa-trash text-danger"></i>
                                      )}
                                    </button>
                                  </div>
                                ) : null}
                                {/* ---------Payment Null or order completed ? Delete Order  */}
                                {/* {order?.orderPaymentId === null && (
                                  <button
                                    className="col-lg-2 btn btn-outline-danger"
                                    onClick={() => deleteOrder(order?.orderId)}
                                  >
                                    {deleteloading ? "Deleting..." : "Deny Order"}
                                  </button>
                                )} */}
                              </div>
                            </div>

                            {/* -------------dropdown Button ----------- */}
                            <button
                              title="Show details"
                              className={`border-none ms-1 shadow-btn shadow-out position-absolute
                          ${
                            window.screen.width < 500
                              ? "dropdown-mobile"
                              : "dropdown-pc"
                          }
                             copy roundedBorder`}
                              onClick={() => {
                                setOrders((prevOrders) => {
                                  const newOrders = [...prevOrders];
                                  newOrders[i] = {
                                    ...newOrders[i],
                                    dropdownOpen: !newOrders[i].dropdownOpen,
                                  };
                                  return newOrders;
                                });
                              }}
                            >
                              <i
                                className={`fa-solid fa-chevron-${
                                  order.dropdownOpen ? "up" : "down"
                                } dim`}
                              ></i>
                            </button>
                          </>
                        )}
                        {order.dropdownOpen && (
                          <>
                            <hr />
                            <div className="row d-flex justify-content-around">
                              <div className="col-lg-5 col-sm-12">
                                {/* --------- ---- Order Id -------------------- */}
                                <span className="text-muted ">
                                  Order ID - {" " + order?.orderId}
                                </span>
                                <button
                                  title="Copy Order ID"
                                  className={`border-none ${
                                    window.screen.width < 500 ? "ms-1" : "mx-3"
                                  }  shadow-btn copy roundedBorder`}
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      order?.orderId
                                    );
                                    toast.success("Order ID Copied");
                                  }}
                                >
                                  <i className="fa-solid fa-clipboard dim"></i>
                                </button>
                              </div>
                              <div className="col-lg-5 col-sm-12">
                                <div className="text-muted">
                                  {/* --------- ---- Payment Id -------------------- */}
                                  Payment ID - {" " + order?.orderPaymentId}
                                  <button
                                    title="Copy Payment ID"
                                    className={`border-none ${
                                      window.screen.width < 500
                                        ? "ms-1"
                                        : "mx-3"
                                    } shadow-btn copy roundedBorder`}
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
                            <hr />
                            <div className="row center">
                              <div className="col-lg-12">
                                <div className="row">
                                  <div className="col-lg-3">
                                    <span className="dim center fw-bold">
                                      Total Files : {order?.orderTotalFiles}
                                    </span>
                                  </div>

                                  <div className="col-lg-3"></div>
                                </div>
                                <br />
                                {/* --------- Options ---------- */}

                                <div className="dim fs-5 fw-bold">Options</div>
                                <div className="center">
                                  <table key={i} className="table">
                                    <thead>
                                      <tr className="dim">
                                        <th scope="col">#</th>
                                        <th scope="col">FileName</th>
                                        <th scope="col">Qty</th>
                                        <th scope="col">B&W</th>
                                        <th scope="col">Color</th>
                                        <th scope="col">Spiral</th>
                                        <th scope="col">Cover</th>
                                        <th scope="col">Single</th>
                                        <th scope="col">Both</th>
                                      </tr>
                                    </thead>
                                    {order?.orderItems.map((item, i) => {
                                      return (
                                        <tbody key={i}>
                                          <tr>
                                            <th scope="row">{i + 1}</th>

                                            <td
                                              data-cell="name"
                                              className="mt-5"
                                            >
                                              <a
                                                target="_blank"
                                                title="download pdf"
                                                href={item.file}
                                                rel="noreferrer"
                                              >
                                                {item.filename}
                                              </a>
                                            </td>
                                            <td data-cell="Qty">
                                              {item.quantity}
                                            </td>
                                            <td data-cell="B&W">
                                              {item.blackandwhite
                                                ? "YES"
                                                : "NO"}
                                            </td>
                                            <td data-cell="color">
                                              {item.color ? "YES" : "NO"}
                                            </td>
                                            <td data-cell="spiral">
                                              {item.spiral ? "YES" : "NO"}
                                            </td>
                                            <td data-cell="cover">
                                              {item.cover ? "YES" : "NO"}
                                            </td>
                                            <td data-cell="single side">
                                              {item.singleSide ? "YES" : "NO"}
                                            </td>
                                            <td data-cell="both side">
                                              {item.bothSide ? "YES" : "NO"}
                                            </td>
                                          </tr>
                                        </tbody>
                                      );
                                    })}
                                  </table>
                                </div>
                                <hr />
                                {/* ---------Address---------- */}
                                <div className="dim fs-5 fw-bold">Address</div>
                                <div className="center">
                                  <table key={i} className="table">
                                    <thead>
                                      <tr className="dim">
                                        <th scope="col">Name</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">Block</th>
                                        <th scope="col">Phone No</th>
                                      </tr>
                                    </thead>
                                    <tbody key={i}>
                                      <tr>
                                        <td data-cell="Name">
                                          {order?.orderAddress.name}
                                        </td>
                                        <td data-cell="Address">
                                          {order?.orderAddress.address}
                                        </td>
                                        <td data-cell="block">
                                          {order?.orderAddress.block}
                                        </td>
                                        <td data-cell="phone no">
                                          {order?.orderAddress.phone}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
};

export default Orders;
