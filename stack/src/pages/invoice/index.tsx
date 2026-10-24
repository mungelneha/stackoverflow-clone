import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useTranslations } from "next-intl";

const Invoice = () => {
  const t = useTranslations("Invoice");

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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {t("downloadInvoice")}
        </h1>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">{t("invoice")}</th>
              <th className="border p-3">{t("plan")}</th>
              <th className="border p-3">{t("amount")}</th>
              <th className="border p-3">{t("status")}</th>
              <th className="border p-3">{t("action")}</th>
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
                    {t("downloadPdf")}
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