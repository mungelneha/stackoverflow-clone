import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";

export default function PricingPage() {
  const t = useTranslations("Pricing");

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getPlans();
  }, []);

  const getPlans = async () => {
    try {
      const res = await axiosInstance.get("/subscription");
      setPlans(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [currentPlan, setCurrentPlan] = useState("Free");

  useEffect(() => {
    getPlans();

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (user?.subscription?.plan) {
      setCurrentPlan(user.subscription.plan);
    }
  }, []);

  const makePayment = async (plan: any) => {
    try {
      const publishableKey =
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      console.log("Stripe key available:", !!publishableKey);

      if (!publishableKey) {
        alert("Stripe key missing. Check .env.local");
        return;
      }

      const stripe = await loadStripe(publishableKey);

      if (!stripe) {
        alert("Stripe initialization failed.");
        return;
      }
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const res = await axiosInstance.post(
        "/payment/create-checkout-session",
        {
          planName: plan.planName,
          price: plan.price,
          userId: user._id,
        }
      );

      const session = res.data;

      await stripe?.redirectToCheckout({
        sessionId: session.id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        {t("subscriptionPlans")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-10">
        {plans.map((plan: any) => (
          <div
            key={plan._id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
          >
            <h2 className="text-2xl font-bold text-center">
              {plan.planName}
            </h2>

            <h3 className="text-center text-3xl font-bold text-blue-600 my-4">
              ₹{plan.price}
            </h3>

            <p className="text-center">
              {t("questionsPerDay")} :{" "}
              {plan.questionLimit >= 999999
                ? t("unlimited")
                : plan.questionLimit}
            </p>

            <p className="font-semibold mt-5 mb-2">
              {t("features")}
            </p>

            <ul className="list-disc ml-5">
              {plan.features.map(
                (feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                )
              )}
            </ul>

            <button
              onClick={() => makePayment(plan)}
              disabled={plan.planName === currentPlan}
              className={`mt-6 w-full py-2 rounded-lg text-white ${
                plan.planName === currentPlan
                  ? "bg-green-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {plan.planName === currentPlan
                ? t("currentPlan")
                : t("upgrade")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}