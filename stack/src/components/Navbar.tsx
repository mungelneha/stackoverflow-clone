import { useAuth } from "@/lib/AuthContext";
import { Menu, Search, Bell, Globe} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useLocale } from "next-intl";
const Navbar = ({ handleslidein }: any) => {
  const router = useRouter();
  const t = useTranslations("Navbar");
  const { user, Logout } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [showMobileOtpModal, setShowMobileOtpModal] = useState(false);

  const [mobileNumber, setMobileNumber] = useState("");

  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const locale = useLocale();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "fr", name: "French", flag: "🇫🇷" },
  ];
    const handleLanguageChange = async (languageCode: string) => {
    try {

      if (languageCode === "fr") {

        await axiosInstance.post("/user/send-french-otp");

        toast.success("OTP sent to your email");

        setShowOtpModal(true);
        setShowLanguages(false);

        return;
      }
      
      if (
        ["en", "es", "hi", "pt", "zh"].includes(languageCode)
      ) {
        setSelectedLanguage(languageCode);
        setShowLanguages(false);
        setShowMobileOtpModal(true);
        return;
      }

      if (user?._id) {

        await axiosInstance.patch(`/user/update/${user._id}`, {
          editForm: {
            language: languageCode,
          },
        });
      }

      await router.push(router.asPath, router.asPath, {
        locale: languageCode,
      });

      setShowLanguages(false);

    } catch (error) {

      console.log(error);
      toast.error("Failed to change language");
    }
  };
  const verifyFrenchOtp = async () => {
    try {
      const res = await axiosInstance.post("/user/verify-french-otp", {
        otp,
      });

      if (res.data.success) {
        if (user?._id) {
          await axiosInstance.patch(`/user/update/${user._id}`, {
            editForm: {
              language: "fr",
            },
          });
        }

        toast.success("French language verified successfully");

        setShowOtpModal(false);
        setOtp("");

        await router.push(router.asPath, router.asPath, {
          locale: "fr",
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };
  const sendMobileOtp = async () => {
    try {
      if (!mobileNumber) {
        toast.error("Please enter your mobile number");
        return;
      }

      const phone = mobileNumber.startsWith("+")
        ? mobileNumber
        : `+91${mobileNumber}`;

      const res = await axiosInstance.post("/user/send-mobile-otp", {
        phone,
      });

      if (res.data.success) {
        toast.success("Demo OTP generated successfully");

        setDemoOtp(res.data.demoOtp);
        setMobileOtpSent(true);
      }
    } catch (error: any) {
      console.error("Mobile OTP Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to generate OTP"
      );
    }
  };
  const verifyMobileOtp = async () => {
    try {
      if (!mobileOtp) {
        toast.error("Please enter OTP");
        return;
      }

      const res = await axiosInstance.post(
        "/user/verify-mobile-otp",
        {
          otp: mobileOtp,
        }
      );

      if (res.data.success) {
        if (user?._id) {
          await axiosInstance.patch(`/user/update/${user._id}`, {
            editForm: {
              language: selectedLanguage,
            },
          });
        }

        toast.success("Mobile OTP verified successfully");

        setShowMobileOtpModal(false);
        setMobileNumber("");
        setMobileOtp("");
        setDemoOtp("");
        setMobileOtpSent(false);

        await router.push(router.asPath, router.asPath, {
          locale: selectedLanguage,
        });
      }
    } catch (error: any) {
      console.error("Mobile OTP Verification Error:", error);

      toast.error(
        error.response?.data?.message || "Invalid OTP"
      );
    }
  };
  useEffect(() => {
    setHasMounted(true);
  }, []);
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);
  const fetchNotifications = async () => {
    if (!user?._id) return;

    try {
      const res = await axiosInstance.get(`/notification/${user._id}`);
      const data = res.data;

      setNotifications(data.data || []);
    } catch (error) {
      console.log(error);
    }
  };
  const handlelogout = () => {
    Logout();
  };

  // Subscription Plan
  const plan = user?.subscription?.plan || "Free";
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;
  return (
    <>
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            
            <h2 className="text-xl font-semibold mb-2">
              Verify Email OTP
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Enter the OTP sent to your email to change the language to French.
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            />

            <button
              type="button"
              onClick={verifyFrenchOtp}
              disabled={otp.length !== 6}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false);
                setOtp("");
              }}
              className="w-full mt-3 px-4 py-2 border rounded-md"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    {showMobileOtpModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-2">
            Verify Mobile Number
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Verify your mobile number to change the language.
          </p>

          {!mobileOtpSent ? (
            <>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              />

              <button
                type="button"
                onClick={sendMobileOtp}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Your Demo OTP is:
              </p>

              <p className="text-2xl font-bold text-blue-600 text-center mb-4">
                {demoOtp}
              </p>

              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value)}
                maxLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              />

              <button
                type="button"
                onClick={verifyMobileOtp}
                disabled={mobileOtp.length !== 6}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
              >
                Verify OTP
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setShowMobileOtpModal(false);
              setMobileNumber("");
              setMobileOtp("");
              setMobileOtpSent(false);
              setDemoOtp("");
            }}
            className="w-full mt-3 px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    <div className="top-0 z-50 w-full min-h-[53px] bg-white border-t-[3px] border-[#ef8236] shadow-[0_1px_5px_#00000033] flex items-center justify-center">
      <div className="w-[90%] max-w-[1440px] flex items-center justify-between mx-auto py-1">

        <button
          aria-label="Toggle sidebar"
          className="sm:block md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={handleslidein}
        >
          <Menu className="w-5 h-5 text-gray-800" />
        </button>

        <div className="flex items-center gap-2 flex-grow">

          <Link href="/" className="px-3 py-1">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </Link>

          <div className="hidden sm:flex gap-1">
           {[
              { key: "about", label: t("about") },
              { key: "products", label: t("products") },
              { key: "forTeams", label: t("forTeams") },
            ].map((item) => (
              <Link
                key={item.key}
                href="/"
                className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <form className="hidden lg:block flex-grow relative px-3">
            <input
              type="text"
              placeholder={t("search")}
              className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            />

            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>

        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguages(!showLanguages)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                <Globe className="w-4 h-4" />
                <span>
                  {languages.find(
                    (language) => language.code === (router.locale || "en")
                  )?.name || "English"}
                </span>
              </button>
              {showLanguages && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
            </div>
          {!hasMounted ? null : !user ? (
            <Link
              href="/auth"
              className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
            >
              Log in
            </Link>
          ) : (
            <>

              <Link
                href={`/users/${user._id}`}
                className="flex items-center justify-center bg-orange-600 text-white text-sm font-semibold w-9 h-9 rounded-full"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              {/* Subscription Badge */}

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  plan === "Gold"
                    ? "bg-yellow-400 text-black"
                    : plan === "Silver"
                    ? "bg-gray-300 text-black"
                    : plan === "Bronze"
                    ? "bg-orange-300 text-black"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {plan}
              </span>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full hover:bg-gray-100"
                  >
                    <Bell className="w-5 h-5" />
                    
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b font-semibold">
                      Notifications
                    </div>

                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500">
                        No Notifications
                      </p>
                    ) : (
                      notifications.map((item: any) => (
                          <Link
                            key={item._id}
                            href={
                              item.type === "follow"
                                ? `/users/${item.sender._id}`
                                : `/users/${user?._id}?postId=${item.postId}&commentId=${item.commentId}&type=${item.type}`
                            }
                            onClick={async () => {
                              try {
                                await axiosInstance.put(`/notification/read/${item._id}`);
                                fetchNotifications();
                              } catch (error) {
                                console.log(error);
                              }

                              setShowNotifications(false);
                            }}
                            className="block p-3 border-b hover:bg-gray-50"
                          >
                            <div className="text-sm">
                              {item.type === "follow" && (
                                <>
                                  <span className="font-semibold">
                                    {item.sender?.name}
                                  </span>{" "}
                                  started following you.
                                </>
                              )}

                              {item.type === "like" && (
                                <>
                                  <span className="font-semibold">
                                    {item.sender?.name}
                                  </span>{" "}
                                  liked your post.
                                </>
                              )}

                              {item.type === "comment" && (
                                <>
                                  <span className="font-semibold">
                                    {item.sender?.name}
                                  </span>{" "}
                                  commented on your post.

                                  {item.comment && (
                                    <p className="mt-1 ml-2 italic text-gray-600">
                                      "{item.comment}"
                                    </p>
                                  )}
                                </>
                              )}
                              {item.type === "reply" && (
                                <>
                                  <span className="font-semibold">
                                    {item.sender?.name}
                                  </span>{" "}
                                  replied to your comment.

                                  {item.comment && (
                                    <p className="mt-1 ml-2 italic text-gray-600">
                                      "{item.comment}"
                                    </p>
                                  )}
                                </>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </Link>
                        ))
                      )} 
                  </div>
                )}
              </div>
              <button
                onClick={handlelogout}
                className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
              >
                Log out
              </button>

            </>
          )}

        </div>

      </div>
    </div>
    </>
  );
};

export default Navbar;