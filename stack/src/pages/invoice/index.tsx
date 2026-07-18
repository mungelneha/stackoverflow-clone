import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    getInvoices();
  }, []);

  const getInvoices = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await axiosInstance.get(
        `/payment/invoices/${user._id}`
      );

      setInvoices(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadInvoice = (paymentId: string) => {
    window.open(
      `http://localhost:5000/payment/invoice/${paymentId}`,
      "_blank"
    );
  };

  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Download Invoice
        </h1>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Invoice</th>
              <th className="border p-3">Plan</th>
              <th className="border p-3">Amount</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice: any) => (
              <tr key={invoice._id}>
                <td className="border p-3">
                  {invoice.invoiceNumber}
                </td>

                <td className="border p-3">
                  {invoice.planName}
                </td>

                <td className="border p-3">
                  ₹{invoice.amount}
                </td>

                <td className="border p-3">
                  {invoice.status}
                </td>

                <td className="border p-3">
                  <button
                    onClick={() =>
                      downloadInvoice(invoice.paymentId)
                    }
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Mainlayout>
  );
};

export default Invoice;