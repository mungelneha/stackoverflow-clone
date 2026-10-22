import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Search, Users, Eye, Edit, Trash2, Power, PauseCircle, } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const UserSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-3 md:gap-0 items-center px-4 py-4 border-b">
      
      {/* User */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />

        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-44 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Role */}
      <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />

      {/* Plan */}
      <div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse" />

      {/* Joined */}
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />

      {/* Status */}
      <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />

      {/* Actions */}
      <div className="flex gap-2">
        <div className="w-7 h-7 bg-gray-200 rounded animate-pulse" />
        <div className="w-7 h-7 bg-gray-200 rounded animate-pulse" />
        <div className="w-7 h-7 bg-gray-200 rounded animate-pulse" />
      </div>

    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(
        `/user/getalluser?page=${currentPage}&limit=10`
      );
      console.log("USERS API RESPONSE:", res.data);
      const newUsers = res.data.data || [];

      if (currentPage === 1) {
        setUsers(newUsers);
      } else {
        setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      }

      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalUsers(res.data.pagination?.totalUsers || 0);

      setHasMore(currentPage < (res.data.pagination?.totalPages || 1));
    } catch (error) {
      console.log(error);
      toast.error("Unable to load users");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight + window.scrollY;

      const pageHeight =
        document.documentElement.scrollHeight;

      if (
        scrollPosition >= pageHeight - 200 &&
        hasMore &&
        !loadingMore
      ) {
        setLoadingMore(true);
        setCurrentPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loadingMore]);

  // Delete user
  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/user/admin/${userId}`);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );

      toast.success("User deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete user");
    }
  };

  // Activate / Deactivate user
  const handleToggleStatus = async (
    userId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus =
        currentStatus === "Active" ? "Blocked" : "Active";

      await axiosInstance.patch(`/user/admin/${userId}/toggle-status`);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                status: newStatus,
              }
            : user
        )
      );

      toast.success(`User ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update user status");
    }
  };

  const handleToggleSuspend = async (
    userId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus =
        currentStatus === "Suspended"
          ? "Active"
          : "Suspended";

      await axiosInstance.patch(
        `/user/admin/${userId}/toggle-suspend`
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                status: newStatus,
              }
            : user
        )
      );

      toast.success(
        newStatus === "Suspended"
          ? "User suspended successfully"
          : "User unsuspended successfully"
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to update suspend status");
    }
  };
  // Search
  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.role?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <Mainlayout>
        <div className="max-w-6xl">
          <div className="mb-6">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse mt-2" />
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {Array.from({ length: 10 }).map((_, index) => (
              <UserSkeleton key={index} />
            ))}
          </div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-red-600" />

            <h1 className="text-2xl font-bold text-gray-800">
              Manage Users
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            View and manage all CodeQuest users.
          </p>
        </div>

        {/* Search + Count */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between mb-5">

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or role..."
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />

            <span>
              Total Users:
              <b className="ml-1 text-gray-800">
                {totalUsers}
              </b>
            </span>
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] bg-gray-50 border-b px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
            <span>User</span>
            <span>Role</span>
            <span>Plan</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {/* Users */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user) => {

              const plan =
                user.subscription?.plan || "Free";

              const status =
                user.status || "Active";

              return (
                <div
                  key={user._id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-3 md:gap-0 items-center px-4 py-4 border-b last:border-b-0 hover:bg-gray-50"
                >

                  {/* User */}
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                      {user.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                  </div>

                  {/* Role */}
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>

                  {/* Plan */}
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        plan === "Gold"
                          ? "bg-yellow-100 text-yellow-700"
                          : plan === "Silver"
                          ? "bg-gray-100 text-gray-700"
                          : plan === "Bronze"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {plan}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="text-sm text-gray-600">
                    {user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString()
                      : "-"}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          status === "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />

                      {status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">

                    {/* View */}
                    <Link
                      href={`/users/${user._id}`}
                      title="View User"
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit */}
                    <Link
                      href={`/admin/users/${user._id}/edit`}
                      title="Edit User"
                      className="p-2 rounded-md text-orange-600 hover:bg-orange-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    {/* Suspend / Unsuspend */}
                    <button
                      onClick={() =>
                        handleToggleSuspend(user._id, status)
                      }
                      title={
                        status === "Suspended"
                          ? "Unsuspend User"
                          : "Suspend User"
                      }
                      className={`p-2 rounded-md ${
                        status === "Suspended"
                          ? "text-green-600 hover:bg-green-50"
                          : "text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>
                  
                    {/* Activate / Deactivate */}
                    <button
                      onClick={() =>
                        handleToggleStatus(user._id, status)
                      }
                      title={
                        status === "Active"
                          ? "Deactivate User"
                          : "Activate User"
                      }
                      className={`p-2 rounded-md ${
                        status === "Active"
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() =>
                        handleDelete(user._id)
                      }
                      title="Delete User"
                      className="p-2 rounded-md text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Loading More Users */}
        {loadingMore && (
          <div className="flex justify-center py-5">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </Mainlayout>
  );
};

export default AdminUsers;