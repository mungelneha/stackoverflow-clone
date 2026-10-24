import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function PaymentHistory() {
  const t = useTranslations("PaymentHistory");

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

  

const downloadInvoice = (paymentId: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    console.error("Backend URL is missing");
    return;
  }

  window.open(
    `${backendUrl}/payment/invoice/${paymentId}`,
    "_blank"
  );
};



  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          {t("paymentHistory")}
        </h1>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">{t("plan")}</th>
              <th className="border p-3">{t("amount")}</th>
              <th className="border p-3">{t("status")}</th>
              <th className="border p-3">{t("date")}</th>
              <th className="border p-3">{t("invoice")}</th>
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
                    onClick={() =>
                      downloadInvoice(payment._id)
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {t("downloadPdf")}
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