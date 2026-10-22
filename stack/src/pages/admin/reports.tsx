import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

const Reports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getReports = async () => {
    try {
      const res = await axiosInstance.get("/report/all");

      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Reports
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage reported posts and user complaints
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="border rounded-lg p-10 text-center bg-white">
          <p className="text-gray-500">
            No reports found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white border rounded-lg p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    Report
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Report ID: {report._id}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-600">
                  Reported
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  Reason
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {report.reason || "No reason provided"}
                </p>
              </div>

              {report.postId && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">
                    Reported Post
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {report.postId.title ||
                      report.postId.question ||
                      "Post details unavailable"}
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleString()
                  : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;