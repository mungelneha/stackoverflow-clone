import { useState } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";

const VerifyDevice = () => {
  const router = useRouter();
  const { Login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const verificationId = localStorage.getItem(
        "deviceVerificationId"
      );

      if (!verificationId) {
        toast.error("Verification request not found");
        return;
      }

      const res = await axiosInstance.post(
        "/user/verify-device",
        {
          verificationId,
          otp,
        }
      );

      const { data, token } = res.data;

      const loggedInUser = {
        ...data,
        token,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      localStorage.removeItem(
        "deviceVerificationId"
      );

      const language = data.language || "en";

      await router.push("/", "/", {
        locale: language,
      });

      toast.success("Device verified successfully");
    } catch (error: any) {
      console.log(
        "Verify Device Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-lg">
        <h1 className="text-2xl font-bold mb-3">
          Verify New Device
        </h1>

        <p className="text-gray-600 mb-5">
          We sent a 6-digit OTP to your registered
          email address.
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className="w-full border rounded-md p-3 mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md"
        >
          {loading
            ? "Verifying..."
            : "Verify Device"}
        </button>
      </div>
    </div>
  );
};

export default VerifyDevice;