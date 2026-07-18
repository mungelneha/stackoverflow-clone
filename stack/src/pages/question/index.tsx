import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Questions() {
  const [question, setQuestion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        console.log("API Response:", res.data);
        setQuestion(res.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, []);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold">
            Top Questions
          </h1>

          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Ask Question
          </button>
        </div>

        <div className="mb-4">
          <span className="text-gray-600">
            {question.length} Questions
          </span>
        </div>

        {question.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No question found.
          </div>
        ) : (
          <div className="space-y-4">
            {question.map((question: any) => (
              <div
                key={question._id}
                className="border-b border-gray-200 pb-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex sm:flex-col items-center text-sm text-gray-600 sm:w-20 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {question.upvote.length}
                      </div>
                      <div className="text-xs">votes</div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`font-medium ${
                          question.answer.length > 0
                            ? "text-green-600 bg-green-100 px-2 py-1 rounded"
                            : ""
                        }`}
                      >
                        {question.noofanswer}
                      </div>

                      <div className="text-xs">
                        {question.noofanswer === 1
                          ? "answer"
                          : "answers"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/question/${question._id}`}
                      className="text-blue-600 hover:text-blue-800 text-lg font-medium"
                    >
                      {question.questiontitle}
                    </Link>

                    <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                      {question.questionbody}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-between mt-3 gap-2">
                      <div className="flex flex-wrap gap-2">
                        {question.questiontags.map((tag: any) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center text-xs text-gray-600">
                        <Link
                          href={`/users/${question.userid}`}
                          className="flex items-center"
                        >
                          <Avatar className="w-5 h-5 mr-1">
                            <AvatarFallback>
                              {question.userposted?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <span className="text-blue-600 mr-1">
                            {question.userposted}
                          </span>
                        </Link>

                        <span>
                          asked{" "}
                          {new Date(
                            question.askedon
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}