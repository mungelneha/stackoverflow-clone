import { useState, useEffect } from "react";
import { createContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";
import { useContext } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // =========================
  // SIGNUP
  // =========================
  const Signup = async ({
    name,
    email,
    phone,
    password,
  }) => {
    setloading(true);
    seterror(null);

    try {
      const res = await axiosInstance.post(
        "/user/signup",
        {
          name,
          email,
          phone,
          password,
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

      setUser(loggedInUser);

      toast.success("Signup Successful");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Signup failed";

      seterror(msg);
      toast.error(msg);
    } finally {
      setloading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================
  const Login = async ({
    email,
    password,
  }) => {
    setloading(true);
    seterror(null);

    try {
      // Get existing device ID
      let deviceId =
        localStorage.getItem("deviceId");

      // Create device ID for first time
      if (!deviceId) {
        deviceId = crypto.randomUUID();

        localStorage.setItem(
          "deviceId",
          deviceId
        );
      }

      console.log(
        "LOGIN DEVICE ID:",
        deviceId
      );

      const res = await axiosInstance.post(
        "/user/login",
        {
          email,
          password,
          deviceId,
        }
      );

      console.log(
        "LOGIN API RESPONSE:",
        res.data
      );

      // =========================
      // NEW DEVICE
      // =========================
      if (
        res.data.requiresDeviceVerification
      ) {
        console.log(
          "NEW DEVICE DETECTED"
        );

        console.log(
          "VERIFICATION ID:",
          res.data.verificationId
        );

        // Save verification ID
        localStorage.setItem(
          "deviceVerificationId",
          res.data.verificationId
        );

        // IMPORTANT:
        // Return verificationId to login page
        return {
          requiresDeviceVerification: true,
          verificationId:
            res.data.verificationId,
          message: res.data.message,
        };
      }

      // =========================
      // NORMAL LOGIN
      // =========================
      const { data, token } = res.data;

      const loggedInUser = {
        ...data,
        token,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      const language =
        data.language || "en";

      await router.push(
        router.asPath,
        router.asPath,
        {
          locale: language,
        }
      );

      toast.success("Login Successful");

      return {
        requiresDeviceVerification: false,
        data: loggedInUser,
        token,
      };
    } catch (error) {
      console.log(
        "LOGIN ERROR:",
        error
      );

      const msg =
        error.response?.data?.message ||
        "Login failed";

      seterror(msg);
      toast.error(msg);

      throw error;
    } finally {
      setloading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const Logout = async () => {
    try {
      await axiosInstance.patch(
        "/user/logout"
      );

      setUser(null);

      localStorage.removeItem("user");

      // Remove old device verification ID
      localStorage.removeItem(
        "deviceVerificationId"
      );

      const currentLocale =
        router.locale || "en";

      await router.push(
        "/",
        "/",
        {
          locale: currentLocale,
        }
      );

      toast.info("Logged out");
    } catch (error) {
      console.log(
        "Logout Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Logout failed"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        Signup,
        Login,
        Logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);