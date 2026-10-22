import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const index = () => {
  const t = useTranslations("Users");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get("/user/getalluser");

        console.log("Users API Response:", res.data);

        setUsers(res.data.data || []);
      } catch (error: any) {
        console.error("Users API Error:", error);

        setError(
          error.response?.data?.message ||
            t("failedToLoad")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [t]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  if (error) {
    return (
      <Mainlayout>
        <div className="text-center text-red-500 mt-10">
          {error}
        </div>
      </Mainlayout>
    );
  }

  if (users.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-10">
          {t("noUsers")}
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-6xl p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">
          {t("title")}
        </h1>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

            <Input
              placeholder={t("filterByUser")}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user: any) => (
            <Link
              key={user._id}
              href={`/users/${user._id}`}
            >
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-3">
                  <Avatar className="w-12 h-12 mr-3">
                    <AvatarFallback className="text-lg">
                      {user.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-blue-600 hover:text-blue-800 truncate">
                      {user.name}
                    </h3>

                    <p className="text-sm text-gray-600 truncate">
                      @{user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />

                  <span>
                    {t("joined")}{" "}
                    {user.joinDate
                      ? new Date(user.joinDate).getFullYear()
                      : t("notAvailable")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;