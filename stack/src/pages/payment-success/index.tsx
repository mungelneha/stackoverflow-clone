import { useEffect } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    console.log("LocalStorage User:", localStorage.getItem("user"));
    const verify = async () => {
      try {
        const sessionId = router.query.session_id;

        if (!sessionId) return;

        await axiosInstance.post("/payment/verify-payment", {
          sessionId,
        });

        // Latest user data घ्या
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const res = await axiosInstance.get(`/user/${user._id}`);

        // localStorage update करा
        localStorage.setItem("user", JSON.stringify(res.data.data));

        console.log("Subscription Updated");
              } catch (error) {
                console.log(error);
              }
            };

    verify();
  }, [router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white shadow-xl rounded-xl p-10 text-center">
        <h1 className="text-4xl font-bold text-green-600">
          ✅ Payment Successful
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Your subscription has been activated successfully.
        </p>

        <Link href="/">
          <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}