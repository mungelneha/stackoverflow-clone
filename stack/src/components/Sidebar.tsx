import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Home,
  MessageSquare,
  MessageSquareIcon,
  Tag,
  Trophy,
  Users,
  CreditCard,
  Crown,
  FileDown,
  ArrowUpCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "./ui/badge";
import { useAuth } from "@/lib/AuthContext";
import { useTranslations } from "next-intl";


const Sidebar = ({ isopen }: any) => {
  const { user } = useAuth();
  const t = useTranslations("Sidebar");

  return (
    <div>
      <aside
        className={cn(
          " top-[53px]  w-48 lg:w-64 min-h-screen bg-white shadow-sm border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          isopen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2 lg:p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Home className="w-4 h-4 mr-2 lg:mr-3" />
                {t("home")}
              </Link>
            </li>
            <li>
              <Link
                href="/question"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" />
                {t("questions")}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                {t("aiAssist")}
                <Badge variant="secondary" className="ml-auto text-xs">
                  {t("new")}
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                {t("tags")}
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                {t("users")}
              </Link>
            </li>
            <li>
              <Link
                href="/community"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                {t("community")}
              </Link>
            </li>
            <li>
              <Link
                href="/community/saved"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                {t("saves")}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Trophy className="w-4 h-4 mr-2 lg:mr-3" />
                {t("challenges")}
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-orange-100 text-orange-800"
                >
                  {t("new")}
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                {t("chat")}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                {t("articles")}
              </Link>
            </li>

            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Building className="w-4 h-4 mr-2 lg:mr-3" />
                {t("companies")}
              </Link>
            </li>
            {user?.role === "admin" && (
            <>
              <hr className="my-4" />

              <li>
                <Link
                  href="/admin"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <Crown className="w-4 h-4 mr-2 lg:mr-3 text-red-600" />
                  {t("adminDashboard")}
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/reports"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <FileText className="w-4 h-4 mr-2 lg:mr-3 text-red-600" />
                  {t("reports")}
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/users"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <Users className="w-4 h-4 mr-2 lg:mr-3 text-red-600" />
                  {t("manageUsers")}
                </Link>
              </li>
            </>
)}
            <hr className="my-4" />
              <li>
                <Link
                  href="/subscription"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <Crown className="w-4 h-4 mr-2 lg:mr-3 text-yellow-500" />
                  {t("subscription")}
                </Link>
              </li>

              <li>
                <Link
                  href="/payment-history"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <CreditCard className="w-4 h-4 mr-2 lg:mr-3 text-green-600" />
                  {t("paymentHistory")}
                </Link>
              </li>

              <li>
                <Link
                  href="/invoice"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <FileDown className="w-4 h-4 mr-2 lg:mr-3 text-blue-600" />
                  {t("downloadInvoice")}
                </Link>
              </li>

              <li>
                <Link
                  href="/pricing"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2 lg:mr-3 text-orange-500" />
                  {t("upgradePlan")}
                </Link>
              </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
