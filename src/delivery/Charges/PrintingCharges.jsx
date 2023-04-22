import React from "react";
const PaperCharges = ({ bwSingle, bwDouble, color }) => {
  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th scope="col" className="dim" title="print">
              <i className="p-1 stroke fa-sharp fa-solid fa-print"></i>
            </th>
            <th scope="col" className="dim">
              <i className="p-1 stroke fa-solid fa-shake fa-sack-dollar"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td> Black and White per page (Single Side)</td>
            <td>₹{bwSingle}.00</td>
          </tr>
          <tr>
            <td>Black and White per page (Both Side)</td>
            <td>₹{bwDouble}.00</td>
          </tr>
          <tr>
            <td>
              {" "}
              Color printing per page
              {/* (Single Side) */}
            </td>
            <td> ₹{color}.00</td>
          </tr>
          {/* <tr>
            <td> Color printing per page(Both Side)</td>
            <td>₹10.00 </td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};

export default PaperCharges;
