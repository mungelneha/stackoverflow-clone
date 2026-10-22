import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import axiosInstance from "@/lib/axiosinstance";
import axios from "axios";

const index = () => {
  const router = useRouter();
  const t = useTranslations("Auth");

  const { Login, loading } = useAuth();

  const [form, setform] = useState({
    email: "",
    password: "",
  });

  const [showOtp, setShowOtp] =
    useState(false);

  const [otp, setOtp] = useState("");

  const [verificationId, setVerificationId] =
    useState("");

  const [otpLoading, setOtpLoading] =
    useState(false);

  const handleChange = (e: any) => {
    setform({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  
  const handlesubmit = async (e: any) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error(t("allFieldsRequired"));
      return;
    }

    try {
      const result = await Login(form);

      console.log("LOGIN RESULT:", result);

      if (result?.requiresDeviceVerification) {
        console.log(
          "VERIFICATION ID:",
          result.verificationId
        );

        setVerificationId(result.verificationId);
        setShowOtp(true);

        toast.info(
          "New device detected. OTP sent to your email."
        );

        return;
      }

      router.push("/", undefined, {
        locale: router.locale,
      });
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Login failed"
      );
    }
  };

  const handleVerifyOtp = async () => {
    console.log("OTP:", otp);
    console.log("VERIFICATION ID:", verificationId);

    if (!verificationId) {
      toast.error("Verification ID is missing");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6 digit OTP");
      return;
    }

    try {
      setOtpLoading(true);

      const res = await axios.post(
        "http://localhost:5000/user/verify-device-otp",
        {
          verificationId: verificationId,
          otp: otp,
        }
      );

      console.log("OTP API RESPONSE:", res.data);

      if (res.data.success) {
        const loggedInUser = {
          ...res.data.data,
          token: res.data.token,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );

        toast.success("Device verified successfully");

        window.location.href = "/";
      }
    } catch (error: any) {
      console.log(
        "OTP VERIFY ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "OTP verification failed"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <Link
            href="/"
            locale={router.locale}
            className="flex items-center justify-center mb-4"
          >
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
              <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
              </div>
            </div>

            <span className="text-lg lg:text-xl font-bold text-gray-800">
              stack
              <span className="font-normal">
                overflow
              </span>
            </span>
          </Link>
        </div>

        {!showOtp ? (
          
          <form onSubmit={handlesubmit}>
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-xl lg:text-2xl">
                  {t("loginToAccount")}
                </CardTitle>

                <CardDescription>
                  {t("enterEmailPassword")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full bg-transparent text-sm"
                  type="button"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>

                  {t("loginWithGoogle")}
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent text-sm"
                  type="button"
                >
                  {t("loginWithGithub")}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>

                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      {t("orContinueWith")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm"
                  >
                    {t("email")}
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    onChange={handleChange}
                    value={form.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm"
                  >
                    {t("password")}
                  </Label>

                  <Input
                    id="password"
                    type="password"
                    onChange={handleChange}
                    value={form.password}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                  disabled={loading}
                >
                  {loading
                    ? t("loading")
                    : t("login")}
                </Button>

                <div className="text-center text-sm">
                  <Link
                    href="/forgot-password"
                    locale={router.locale}
                    className="text-blue-600 hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>

                <div className="text-center text-sm">
                  {t("dontHaveAccount")}{" "}
                  <Link
                    href="/signup"
                    locale={router.locale}
                    className="text-blue-600 hover:underline"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                Verify New Device
              </CardTitle>

              <CardDescription>
                We detected a new device.
                <br />
                Enter the 6-digit OTP sent to
                your registered email.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">
                  Verification OTP
                </Label>

                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6 digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />
              </div>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={
                  otpLoading ||
                  otp.length !== 6
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {otpLoading
                  ? "Verifying..."
                  : "Verify Device"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowOtp(false);
                  setOtp("");
                  setVerificationId("");
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default index;