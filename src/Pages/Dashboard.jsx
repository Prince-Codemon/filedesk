import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import getToken from "../utils/getToken";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
const Dashboard = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("");
  const [type, setType] = useState();
  const [loading, setLoading] = useState(true);
  const token = getToken();
  if (!token) {
    navigate("/auth");
  }
  const accType = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/user/accounttype`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Secret-Key": `${process.env.REACT_APP_SECRET_KEY}`,
        },
      }
    );
    setLoading(false);
    const data = await res.json();
    setType(data?.type);
    return data?.type;
  };
  useEffect(() => {
    document.title = "FileDesk | Dashboard";
    accType();
  }, []);

  if (type === "user") {
    navigate("/orders");
  }
  if (type === null) {
    navigate("/auth");
  }

  return (
    <>
      {type === "admin" && !loading ? (
        <div className="container pop my-5 dashboard ">
          <div className="container center ">
            <div className="center"></div>
            <div className="d-flex">
              <Link
                data-tooltip="Orders"
                to="/dashboard/orders"
                className={` p-2 dim fw-bold ${
                  active === "orders" ? "shadow-in" : "shadow-out "
                } mx-2 tt shadow-btn`}
                onClick={() => setActive("orders")}
              >
                <i className="fa-brands fa-shopify fs-4 mx-2 fa-shake"></i>
                Orders
              </Link>
              <Link
                data-tooltip="Charges"
                to="/dashboard/shop"
                className={`tt p-2  ${
                  active === "charges" ? "shadow-in" : "shadow-out"
                } dim fw-bold  mx-2 shadow-btn`}
                onClick={() => setActive("charges")}
              >
                <i className="fa-solid fa-sack-dollar fs-4 mx-2 fa-fade"></i>
                Charges
              </Link>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="row center" style={{ height: "70vh" }}>
          <HashLoader size={50} color="#5b4af1" />
        </div>
      ) : null}
    </>
  );
};

export default Dashboard;
