import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  Flag,
  Crown,
  ShieldCheck,
  Monitor,
  MapPin,
  Clock,
  RefreshCw,
} from "lucide-react";

import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);

  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [loginLoading, setLoginLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role !== "admin") {
      router.push("/");
    }
  }, [mounted, user, router]);

  const fetchLoginActivity = async () => {
    try {
      setLoginLoading(true);

      const response = await axiosInstance.get(
        "/user/admin/login-activity"
      );

      if (response.data.success) {
        setLoginActivity(response.data.data || []);
      }
    } catch (error) {
      console.log("Error fetching login activity:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && user?.role === "admin") {
      fetchLoginActivity();
    }
  }, [mounted, user]);

  if (!mounted) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Mainlayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor your CodeQuest platform
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Total Users */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Users
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  8
                </h2>
              </div>

              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Questions */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Questions
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  0
                </h2>
              </div>

              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Posts
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  0
                </h2>
              </div>

              <div className="bg-purple-100 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Reports */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Reports
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  0
                </h2>
              </div>

              <div className="bg-red-100 p-3 rounded-full">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Premium Users */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Premium Users
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  0
                </h2>
              </div>

              <div className="bg-yellow-100 p-3 rounded-full">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Payments */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Payments
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  ₹0
                </h2>
              </div>

              <div className="bg-emerald-100 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Admin Information */}
        <div className="mt-6 bg-white border rounded-lg p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-800">
            Admin Information
          </h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">
                Admin Name
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Email
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Role
              </p>

              <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded">
                Administrator
              </span>
            </div>

            <div>
              <p className="text-gray-500">
                Subscription
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {user.subscription?.plan || "Free"}
              </p>
            </div>

          </div>
        </div>

        {/* Login Activity */}
        <div className="mt-6 bg-white border rounded-lg shadow-sm overflow-hidden">

          {/* Login Activity Header */}
          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <div className="flex items-center gap-2">

                <ShieldCheck className="w-5 h-5 text-red-600" />

                <h2 className="text-lg font-semibold text-gray-800">
                  Login Activity
                </h2>

              </div>

              <p className="text-sm text-gray-500 mt-1">
                Monitor user login sessions and device activity
              </p>
            </div>

            <button
              onClick={fetchLoginActivity}
              disabled={loginLoading}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loginLoading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

          </div>

          {/* Loading */}
          {loginLoading ? (
            <div className="text-center py-10 text-gray-500">
              Loading login activity...
            </div>
          ) : loginActivity.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No login activity found.
            </div>
          ) : (
            <div className="divide-y">

              {loginActivity.map((session) => {

                const userName =
                  session.userId?.name || "Unknown User";

                const userEmail =
                  session.userId?.email || "Unknown Email";

                const loginDate = session.loginTime
                  ? new Date(
                      session.loginTime
                    ).toLocaleString()
                  : "Unknown";

                const lastActivity = session.lastActivity
                  ? new Date(
                      session.lastActivity
                    ).toLocaleString()
                  : "Unknown";

                return (
                  <div
                    key={session.sessionId}
                    className="p-5 hover:bg-gray-50"
                  >

                    {/* Top */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                      {/* User */}
                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                          {userName
                            .split(" ")
                            .map((name: string) => name[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <p className="font-semibold text-gray-800 truncate">
                            {userName}
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {userEmail}
                          </p>

                        </div>

                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.isRevoked
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {session.isRevoked
                            ? "Revoked"
                            : "Active"}
                        </span>

                        {session.isTrusted && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                            Trusted Device
                          </span>
                        )}

                      </div>

                    </div>

                    {/* Details */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* Browser */}
                      <div className="flex items-start gap-2">

                        <Monitor className="w-4 h-4 text-gray-400 mt-0.5" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Browser
                          </p>

                          <p className="text-sm text-gray-700">
                            {session.browser || "Unknown"}
                          </p>
                        </div>

                      </div>

                      {/* OS */}
                      <div className="flex items-start gap-2">

                        <Monitor className="w-4 h-4 text-gray-400 mt-0.5" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Operating System
                          </p>

                          <p className="text-sm text-gray-700">
                            {session.operatingSystem ||
                              "Unknown"}
                          </p>
                        </div>

                      </div>

                      {/* Device */}
                      <div className="flex items-start gap-2">

                        <Monitor className="w-4 h-4 text-gray-400 mt-0.5" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Device
                          </p>

                          <p className="text-sm text-gray-700">
                            {session.deviceType ||
                              "Unknown"}
                          </p>
                        </div>

                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2">

                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Location
                          </p>

                          <p className="text-sm text-gray-700">
                            {session.location ||
                              "Unknown"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Session Information */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

                      <div>
                        <p className="text-xs text-gray-400">
                          IP Address
                        </p>

                        <p className="text-gray-700 mt-1">
                          {session.ipAddress ||
                            "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Login Time
                        </p>

                        <div className="flex items-center gap-1 mt-1 text-gray-700">

                          <Clock className="w-3.5 h-3.5 text-gray-400" />

                          {loginDate}

                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Last Activity
                        </p>

                        <div className="flex items-center gap-1 mt-1 text-gray-700">

                          <Clock className="w-3.5 h-3.5 text-gray-400" />

                          {lastActivity}

                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </Mainlayout>
  );
};

export default AdminDashboard;