import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    getHistory();
  }, []);

  const getHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await axiosInstance.get(
        `/payment/history/${user._id}`
      );

      setPayments(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const downloadInvoice = async (paymentId: string) => {
    try {
      window.open(
        `http://localhost:5000/payment/invoice/${paymentId}`,
        "_blank"
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Payment History
        </h1>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Plan</th>
              <th className="border p-3">Amount</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Date</th>
              <th className="border p-3">Invoice</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment: any) => (
              <tr key={payment._id}>
                <td className="border p-3">
                  {payment.planName}
                </td>

                <td className="border p-3">
                  ₹{payment.amount}
                </td>

                <td className="border p-3">
                  {payment.paymentStatus}
                </td>

                <td className="border p-3">
                  {new Date(
                    payment.paymentDate
                  ).toLocaleDateString()}
                </td>
                <td className="border p-3">
                  <Button
                    onClick={() => downloadInvoice(payment._id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Download pdf
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Mainlayout>
  );
}