import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";
import Reputation from "../models/reputation.js";

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
    const existingQuestion = await question.findById(_id);

    if (!existingQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const questionOwner = await user.findById(
      existingQuestion.userid
    );

    await question.findByIdAndDelete(_id);

    if (questionOwner) {
      questionOwner.reputation = Math.max(
        0,
        questionOwner.reputation - 10
      );

      await questionOwner.save();

      await Reputation.create({
        user: existingQuestion.userid,
        amount: 10,
        type: "lost",
        reason:
          "Question removed by admin for guideline violation",
        source: "admin_removed",
        relatedContent: _id,
      });
    }

    res.status(200).json({
      message:
        "Question removed successfully and 10 reputation deducted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
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

    if (!questionDoc) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

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

    // Give +2 reputation when question reaches exactly 10 upvotes
    if (
      questionvote.upvote.length === 10 &&
      upindex === -1 &&
      value === "upvote"
    ) {
      const questionOwner = await User.findById(questionvote.userid);

      if (questionOwner) {
        questionOwner.reputation += 2;
        await questionOwner.save();

        await Reputation.create({
          user: questionvote.userid,
          amount: 2,
          type: "earned",
          reason: "Question received 10 upvotes",
          source: "question_10_upvotes",
          relatedContent: _id,
          relatedUser: userid,
        });
      }
    }

    // Deduct -2 reputation when question receives a downvote
    if (
      value === "downvote" &&
      downindex === -1
    ) {
      const questionOwner = await User.findById(questionvote.userid);

      if (questionOwner) {
        questionOwner.reputation = Math.max(
          0,
          questionOwner.reputation - 2
        );

        await questionOwner.save();

        await Reputation.create({
          user: questionvote.userid,
          amount: 2,
          type: "lost",
          reason: "Question received a downvote",
          source: "downvote",
          relatedUser: userid,
          relatedContent: _id,
        });
      }
    }

    res.status(200).json({
      data: questionvote,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const acceptanswer = async (req, res) => {
  const { id: questionId } = req.params;
  const { answerid, userid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({
      message: "Question unavailable",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({
      message: "Answer unavailable",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(400).json({
      message: "User unavailable",
    });
  }

  try {
    const questionDoc = await question.findById(questionId);

    if (!questionDoc) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // Only the question owner can accept an answer
    if (String(questionDoc.userid) !== String(userid)) {
      return res.status(403).json({
        message: "Only the question owner can accept an answer",
      });
    }

    const answerIndex = questionDoc.answer.findIndex(
      (answer) => String(answer._id) === String(answerid)
    );

    if (answerIndex === -1) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    // If another answer is already accepted, don't allow another one
    const alreadyAcceptedIndex = questionDoc.answer.findIndex(
      (answer) => answer.isAccepted === true
    );

    if (
      alreadyAcceptedIndex !== -1 &&
      alreadyAcceptedIndex !== answerIndex
    ) {
      return res.status(400).json({
        message: "Another answer is already accepted",
      });
    }

    // Prevent giving +10 more than once
    if (questionDoc.answer[answerIndex].isAccepted === true) {
      return res.status(400).json({
        message: "This answer is already accepted",
      });
    }

    questionDoc.answer[answerIndex].isAccepted = true;

    await questionDoc.save();

    const answerUserId = questionDoc.answer[answerIndex].userid;

    const answerUser = await User.findById(answerUserId);

    if (answerUser) {
      answerUser.reputation += 10;

      await answerUser.save();

      await Reputation.create({
        user: answerUserId,
        amount: 10,
        type: "earned",
        reason: "Answer accepted",
        source: "answer_accepted",
        relatedUser: userid,
        relatedContent: questionId,
      });
    }

    res.status(200).json({
      message: "Answer accepted successfully and 10 reputation added",
      data: questionDoc,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
export const voteToClose = async (req, res) => {
  const { id: questionId } = req.params;
  const { userid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({
      message: "Question unavailable",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(400).json({
      message: "User unavailable",
    });
  }

  try {
    const questionDoc = await question.findById(questionId);

    if (!questionDoc) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const userAlreadyVoted = questionDoc.closeVotes.includes(
      String(userid)
    );

    if (userAlreadyVoted) {
      questionDoc.closeVotes = questionDoc.closeVotes.filter(
        (id) => id !== String(userid)
      );
    } else {
      questionDoc.closeVotes.push(String(userid));
    }

    await questionDoc.save();

    res.status(200).json({
      message: userAlreadyVoted
        ? "Close vote removed successfully"
        : "Close vote added successfully",
      closeVotes: questionDoc.closeVotes.length,
      data: questionDoc,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};