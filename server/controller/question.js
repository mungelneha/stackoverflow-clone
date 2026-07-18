import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";

export const Askquestion = async (req, res) => {
  try {
    const { postquestiondata } = req.body;

    const user = await User.findById(postquestiondata.userid);
    console.log("User ID:", postquestiondata.userid);
    console.log("User:", user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const questionCount = await question.countDocuments({
      
      userid: postquestiondata.userid,
      askedon: {
        $gte: today,
      },
    });
    console.log("Plan:", user.subscription);
    console.log("Question Count:", questionCount);
    let questionLimit = 1;

    switch (user.subscription.plan) {
      case "Bronze":
        questionLimit = 5;
        break;

      case "Silver":
        questionLimit = 15;
        break;

      case "Gold":
        questionLimit = Infinity;
        break;

      default:
        questionLimit = 1;
    }
    console.log("Plan:", user.subscription.plan);
    console.log("Today's Questions:", questionCount);
    console.log("Limit:", questionLimit);
    if (questionCount >= questionLimit) {
      return res.status(403).json({
        message: `Daily question limit reached. Your ${user.subscription.plan} plan allows ${
          questionLimit === Infinity ? "Unlimited" : questionLimit
        } question(s) per day.`,
      });
    }

    const postques = new question({
      ...postquestiondata,
    });

    await postques.save();

    res.status(200).json({
      data: postques,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });

    res.status(200).json({
      data: allquestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "Question unavailable",
    });
  }

  try {
    await question.findByIdAndDelete(_id);

    res.status(200).json({
      message: "Question deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "Question unavailable",
    });
  }

  try {
    const questionDoc = await question.findById(_id);

    const upindex = questionDoc.upvote.findIndex(
      (id) => id === String(userid)
    );

    const downindex = questionDoc.downvote.findIndex(
      (id) => id === String(userid)
    );

    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }

      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter(
          (id) => id !== String(userid)
        );
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter(
          (id) => id !== String(userid)
        );
      }

      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
    }

    const questionvote = await question.findByIdAndUpdate(
      _id,
      questionDoc,
      { new: true }
    );

    res.status(200).json({
      data: questionvote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};