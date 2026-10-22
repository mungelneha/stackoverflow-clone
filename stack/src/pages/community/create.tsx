import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreatePost() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [hashtags, setHashtags] = useState("");

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const formData = new FormData();

      formData.append("userId", user.result?._id || user._id);
      formData.append("userName", user.result?.name || user.name);
      formData.append("content", content);
      formData.append("codeSnippet", codeSnippet);
      formData.append(
        "hashtags",
        JSON.stringify(
          hashtags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        )
      );

      if (image) {
        formData.append("image", image);
      }

      await axiosInstance.post("/post/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post Created Successfully");

      router.push("/community");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create post");
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Create Post
        </h1>

        <div className="bg-white border rounded-lg p-6">

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-3 h-40"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setImage(e.target.files[0]);
              }
            }}
            className="w-full border rounded-lg p-3 mt-4"
          />
          <input
            type="text"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Code Snippet"
            className="w-full border rounded-lg p-3 mt-4"
          />

          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="Hashtags (comma separated)"
            className="w-full border rounded-lg p-3 mt-4"
          />

          <button
            onClick={handleSubmit}
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Publish Post
          </button>

        </div>
      </div>
    </Mainlayout>
  );
}