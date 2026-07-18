import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { Crown } from "lucide-react";
import Link from "next/link";

const Subscription = () => {
  const { user } = useAuth();

  return (
    <Mainlayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">
                Subscription
            </h1>
        </div>
        <div className="bg-white border rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between">
            <span className="font-semibold">Current Plan</span>
            <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user?.subscription?.plan === "Gold"
                    ? "bg-yellow-400 text-black"
                    : user?.subscription?.plan === "Silver"
                    ? "bg-gray-300 text-black"
                    : user?.subscription?.plan === "Bronze"
                    ? "bg-orange-300 text-black"
                    : "bg-gray-100 text-gray-700"
                }`}
            >
                {user?.subscription?.plan}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Status</span>
            <span>{user?.subscription?.status}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Badge</span>
            <span>{user?.subscription?.badge}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Renewal Date</span>
            <span>
              {new Date(
                user?.subscription?.renewalDate
              ).toLocaleDateString()}
            </span>
            <p className="text-green-600 text-sm mt-2">
                ✅ Your subscription is active until{" "}
                {new Date(
                    user?.subscription?.renewalDate
                ).toLocaleDateString()}.
            </p>
          </div>
          <div className="mt-6 flex gap-4">
            <Link
                href="/pricing"
                className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600"
            >
                Upgrade Plan
            </Link>
            <Link
                href="/payment-history"
                className="border border-gray-300 px-5 py-2 rounded hover:bg-gray-100"
                >
                Payment History
            </Link>
          </div>

        </div>
      </div>
    </Mainlayout>
  );
};

export default Subscription;