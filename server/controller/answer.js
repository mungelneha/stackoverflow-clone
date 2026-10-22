import mongoose from "mongoose";
import question from "../models/question.js";
import user from "../models/auth.js";
import Reputation from "../models/reputation.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }

  const { noofanswer, answerbody, useranswered, userid } = req.body;

  if (!userid || !mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(400).json({ message: "valid user id is required" });
  }

  try {
    const updatequestion = await question.findByIdAndUpdate(
      _id,
      {
        $addToSet: {
          answer: [{ answerbody, useranswered, userid }],
        },
      },
      { new: true }
    );

    if (!updatequestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await updatenoofanswer(_id, noofanswer);

    // Add +5 reputation to the user who posted the answer
    const answerUser = await user.findById(userid);

    if (answerUser) {
      answerUser.reputation += 5;
      await answerUser.save();

      await Reputation.create({
        user: userid,
        amount: 5,
        type: "earned",
        reason: "Posted an answer",
        source: "answer_posted",
        relatedContent: _id,
      });
    }

    res.status(200).json({
      data: updatequestion,
      message: "Answer posted successfully and 5 reputation added",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const updatenoofanswer = async (_id, noofanswer) => {
  try {
    await question.findByIdAndUpdate(_id, {
      $set: { noofanswer: noofanswer },
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;

  const { noofanswer, answerid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "question unavailable",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({
      message: "answer unavailable",
    });
  }

  try {
    // Find the question and the answer before deleting it
    const existingQuestion = await question.findById(_id);

    if (!existingQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const answerToDelete = existingQuestion.answer.find(
      (answer) => answer._id.toString() === answerid
    );

    if (!answerToDelete) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    const answerUserId = answerToDelete.userid;

    // Delete answer
    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: {
          answer: { _id: answerid },
        },
      }
    );

    await updatenoofanswer(_id, noofanswer);

    // Deduct 5 reputation from answer owner
    if (
      answerUserId &&
      mongoose.Types.ObjectId.isValid(answerUserId)
    ) {
      const answerUser = await user.findById(answerUserId);

      if (answerUser) {
        answerUser.reputation = Math.max(
          0,
          answerUser.reputation - 5
        );

        await answerUser.save();

        await Reputation.create({
          user: answerUserId,
          amount: 5,
          type: "lost",
          reason: "Answer deleted by user",
          source: "answer_deleted",
          relatedContent: _id,
        });
      }
    }

    res.status(200).json({
      data: updatequestion,
      message: "Answer deleted successfully and 5 reputation deducted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
export const adminDeleteAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "question unavailable",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({
      message: "answer unavailable",
    });
  }

  try {
    const existingQuestion = await question.findById(_id);

    if (!existingQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const answerToDelete = existingQuestion.answer.find(
      (answer) => answer._id.toString() === answerid
    );

    if (!answerToDelete) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    const answerUserId = answerToDelete.userid;

    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: {
          answer: { _id: answerid },
        },
      }
    );

    await question.findByIdAndUpdate(_id, {
      noofanswer: Math.max(0, existingQuestion.answer.length - 1),
    });

    if (
      answerUserId &&
      mongoose.Types.ObjectId.isValid(answerUserId)
    ) {
      const answerUser = await user.findById(answerUserId);

      if (answerUser) {
        answerUser.reputation = Math.max(
          0,
          answerUser.reputation - 10
        );

        await answerUser.save();

        await Reputation.create({
          user: answerUserId,
          amount: 10,
          type: "lost",
          reason: "Answer removed by admin for guideline violation",
          source: "admin_removed",
          relatedContent: _id,
        });
      }
    }

    res.status(200).json({
      data: updatequestion,
      message:
        "Answer removed by admin and 10 reputation deducted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
export const voteanswer = async (req, res) => {
  const { id: questionId } = req.params;
  const { answerid, userid, value } = req.body;

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

  if (!userid || !mongoose.Types.ObjectId.isValid(userid)) {
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

    const answerIndex = questionDoc.answer.findIndex(
      (answer) => String(answer._id) === String(answerid)
    );

    if (answerIndex === -1) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    const answer = questionDoc.answer[answerIndex];

    // Make sure upvote and downvote arrays exist
    answer.upvote = answer.upvote || [];
    answer.downvote = answer.downvote || [];

    const upvoteIndex = answer.upvote.findIndex(
      (id) => String(id) === String(userid)
    );

    const downvoteIndex = answer.downvote.findIndex(
      (id) => String(id) === String(userid)
    );

    if (value === "upvote") {
      // Remove downvote if it already exists
      if (downvoteIndex !== -1) {
        answer.downvote = answer.downvote.filter(
          (id) => String(id) !== String(userid)
        );
      }

      // Toggle upvote
      if (upvoteIndex === -1) {
        answer.upvote.push(userid);
      } else {
        answer.upvote = answer.upvote.filter(
          (id) => String(id) !== String(userid)
        );
      }
    }

    if (value === "downvote") {
      // Remove upvote if it already exists
      if (upvoteIndex !== -1) {
        answer.upvote = answer.upvote.filter(
          (id) => String(id) !== String(userid)
        );
      }

      // Toggle downvote
      if (downvoteIndex === -1) {
        answer.downvote.push(userid);
      } else {
        answer.downvote = answer.downvote.filter(
          (id) => String(id) !== String(userid)
        );
      }
    }

    const updatedQuestion = await questionDoc.save();

    // Give +5 reputation when answer reaches exactly 5 upvotes
    if (
      updatedQuestion.answer[answerIndex].upvote.length === 5 &&
      upvoteIndex === -1 &&
      value === "upvote"
    ) {
      const answerUserId = updatedQuestion.answer[answerIndex].userid;

      const answerUser = await user.findById(answerUserId);

      if (answerUser) {
        answerUser.reputation += 5;
        await answerUser.save();

        await Reputation.create({
          user: answerUserId,
          amount: 5,
          type: "earned",
          reason: "Answer received 5 upvotes",
          source: "answer_5_upvotes",
          relatedUser: userid,
          relatedContent: questionId,
        });
      }
    }

    // Deduct -2 reputation when answer receives a downvote
    if (
      value === "downvote" &&
      downvoteIndex === -1
    ) {
      const answerUserId = updatedQuestion.answer[answerIndex].userid;

      const answerUser = await user.findById(answerUserId);

      if (answerUser) {
        answerUser.reputation = Math.max(
          0,
          answerUser.reputation - 2
        );

        await answerUser.save();

        await Reputation.create({
          user: answerUserId,
          amount: 2,
          type: "lost",
          reason: "Answer received a downvote",
          source: "downvote",
          relatedUser: userid,
          relatedContent: questionId,
        });
      }
    }

    res.status(200).json({
      message: "Answer vote updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};