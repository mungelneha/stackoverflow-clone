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

const Sidebar = ({ isopen }: any) => {
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
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/question"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" />
                Questions
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                AI Assist
                <Badge variant="secondary" className="ml-auto text-xs">
                  Labs
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                Tags
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                Saves
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Trophy className="w-4 h-4 mr-2 lg:mr-3" />
                Challenges
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-orange-100 text-orange-800"
                >
                  NEW
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                Chat
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                Articles
              </Link>
            </li>

            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Building className="w-4 h-4 mr-2 lg:mr-3" />
                Companies
              </Link>
            </li>
            <hr className="my-4" />
              <li>
                <Link
                  href="/subscription"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <Crown className="w-4 h-4 mr-2 lg:mr-3 text-yellow-500" />
                  Subscription
                </Link>
              </li>

              <li>
                <Link
                  href="/payment-history"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <CreditCard className="w-4 h-4 mr-2 lg:mr-3 text-green-600" />
                  Payment History
                </Link>
              </li>

              <li>
                <Link
                  href="/invoice"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <FileDown className="w-4 h-4 mr-2 lg:mr-3 text-blue-600" />
                  Download Invoice
                </Link>
              </li>

              <li>
                <Link
                  href="/pricing"
                  className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2 lg:mr-3 text-orange-500" />
                  Upgrade Plan
                </Link>
              </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
