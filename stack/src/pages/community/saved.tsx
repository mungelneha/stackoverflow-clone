import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useEffect, useState } from "react";

const SavedPosts = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchSavedPosts();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      const res = await axiosInstance.get(
        `/post/saved/${user?._id}`
      );

      setPosts(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Saved Posts
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">
            No Saved Posts
          </p>
        ) : (
          <div className="space-y-5">

            {posts.map((post: any) => (
              <div
                key={post._id}
                className="border rounded-lg p-5 bg-white"
              >

                <h2 className="font-semibold">
                  {post.userName}
                </h2>

                <p className="mt-2">
                  {post.content}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    className="rounded-lg mt-3"
                  />
                )}

                {post.codeSnippet && (
                  <pre className="bg-gray-100 p-3 rounded mt-3 overflow-auto">
                    <code>{post.codeSnippet}</code>
                  </pre>
                )}

                <div className="flex gap-3 mt-3 flex-wrap">

                  {post.hashtags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-blue-600"
                    >
                      #{tag}
                    </span>
                  ))}

                </div>

                <div className="flex gap-5 mt-3 text-gray-600 text-sm">

                  <span>❤️ {post.likes.length}</span>

                  <span>💬 {post.comments.length}</span>

                  <span>🔖 {post.bookmarks.length}</span>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </Mainlayout>
  );
};

export default SavedPosts;