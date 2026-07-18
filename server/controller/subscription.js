import Subscription from "../models/subscription.js";

export const createDefaultPlans = async (req, res) => {
  try {
    const count = await Subscription.countDocuments();

    if (count > 0) {
      return res.status(200).json({
        message: "Plans already exist",
      });
    }

    await Subscription.insertMany([
      {
        planName: "Free",
        price: 0,
        duration: 30,
        questionLimit: 1,
        badge: "Free",
        features: [
          "Basic Search",
        ],
      },

      {
        planName: "Bronze",
        price: 99,
        duration: 30,
        questionLimit: 5,
        badge: "Bronze",
        features: [
          "Bronze Badge",
          "Advanced Search",
        ],
      },

      {
        planName: "Silver",
        price: 299,
        duration: 30,
        questionLimit: 15,
        badge: "Silver",
        features: [
          "Silver Badge",
          "Priority Support",
          "Enhanced Profile Visibility",
          "Unlimited Bookmarks",
        ],
      },

      {
        planName: "Gold",
        price: 999,
        duration: 30,
        questionLimit: 999999,
        badge: "Gold",
        features: [
          "Gold Badge",
          "Highest Search Priority",
          "Featured Profile",
          "Priority Support",
          "Exclusive Community Features",
        ],
      },
    ]);

    res.status(201).json({
      message: "Subscription Plans Created Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {

    const plans = await Subscription.find();

    res.status(200).json(plans);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });

  }
};