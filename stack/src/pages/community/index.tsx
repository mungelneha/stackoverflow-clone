import Mainlayout from "@/layout/Mainlayout";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export default function CommunityFeed() {
  const t = useTranslations("Community");

  const [posts, setPosts] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const POSTS_PER_PAGE = 2;

  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyCommentId, setReplyCommentId] = useState("");
  const [editingReplyId, setEditingReplyId] = useState("");
  const [editingReplyCommentId, setEditingReplyCommentId] = useState("");
  const [editReplyText, setEditReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editingPostForComment, setEditingPostForComment] = useState("");
  const [search, setSearch] = useState("");
  const [editingPostId, setEditingPostId] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCodeSnippet, setEditCodeSnippet] = useState("");
  const [editHashtags, setEditHashtags] = useState("");

  const fetchPosts = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await axiosInstance.get(
        `/post/all?page=${pageNumber}&limit=${POSTS_PER_PAGE}`
      );

      const newPosts = res.data.data || [];

      if (pageNumber === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }

      setHasMore(res.data.pagination?.hasMore || false);
      setPage(pageNumber);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTrendingPosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (
        scrollPosition >= pageHeight - 300 &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        fetchPosts(page + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, hasMore, loadingMore, loading]);

  const fetchTrendingPosts = async () => {
    try {
      const res = await axiosInstance.get("/post/trending");
      setTrendingPosts(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.post("/post/like", {
        postId,
        userId: user.result?._id || user._id,
      });

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.post("/post/bookmark", {
        postId,
        userId: user.result?._id || user._id,
      });

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await axiosInstance.post("/post/share", {
        postId,
        userId: user.result?._id || user._id,
      });

      setPosts((prevPosts: any[]) =>
        prevPosts.map((post: any) =>
          post._id === postId ? response.data.data : post
        )
      );

      setTrendingPosts((prevPosts: any[]) =>
        prevPosts.map((post: any) =>
          post._id === postId ? response.data.data : post
        )
      );

      const link = `${window.location.origin}/community`;

      await navigator.clipboard.writeText(link);

      alert(t("postLinkCopied"));
    } catch (error) {
      console.log(error);
    }
  };

  const handleReport = async (postId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const currentUserId = user.result?._id || user._id;

      if (!currentUserId) {
        alert(t("pleaseLogin"));
        return;
      }

      const reason = window.prompt(t("reportReason"));

      if (!reason || !reason.trim()) {
        return;
      }

      await axiosInstance.post("/report/post", {
        postId,
        reporterId: currentUserId,
        reason: reason.trim(),
      });

      alert(t("postReported"));
    } catch (error: any) {
      console.log(error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert(t("reportFailed"));
      }
    }
  };

  const handleComment = async (postId: string) => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!comment.trim()) return;

      await axiosInstance.post("/post/comment", {
        postId,
        userId: user.result?._id || user._id,
        userName: user.result?.name || user.name,
        comment,
      });

      setComment("");
      fetchPosts();
      fetchTrendingPosts();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          error.response?.data?.message ||
            "You need at least 50 reputation to comment"
        );
        return;
      }

      console.log(error);
    }
  };

  const handleReply = async (
    postId: string,
    commentId: string
  ) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!replyText.trim()) return;

      await axiosInstance.post("/post/reply", {
        postId,
        commentId,
        userId: user.result?._id || user._id,
        userName: user.result?.name || user.name,
        reply: replyText,
      });

      setReplyText("");
      setReplyCommentId("");

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditReply = (
    postId: string,
    commentId: string,
    replyId: string,
    currentReply: string
  ) => {
    setEditingPostForComment(postId);
    setEditingReplyCommentId(commentId);
    setEditingReplyId(replyId);
    setEditReplyText(currentReply);
  };

  const handleUpdateReply = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!editReplyText.trim()) return;

      await axiosInstance.put("/post/reply/edit", {
        postId: editingPostForComment,
        commentId: editingReplyCommentId,
        replyId: editingReplyId,
        userId: user.result?._id || user._id,
        reply: editReplyText,
      });

      setEditingReplyId("");
      setEditingReplyCommentId("");
      setEditReplyText("");

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteReply = async (
    postId: string,
    commentId: string,
    replyId: string
  ) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.delete("/post/reply/delete", {
        data: {
          postId,
          commentId,
          replyId,
          userId: user.result?._id || user._id,
        },
      });

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditComment = (
    postId: string,
    commentId: string,
    currentComment: string
  ) => {
    setEditingPostForComment(postId);
    setEditingCommentId(commentId);
    setEditComment(currentComment);
  };

  const handleUpdateComment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.put("/post/comment/edit", {
        postId: editingPostForComment,
        commentId: editingCommentId,
        userId: user.result?._id || user._id,
        comment: editComment,
      });

      setEditingCommentId("");
      setEditingPostForComment("");
      setEditComment("");

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComment = async (
    postId: string,
    commentId: string
  ) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.delete("/post/comment/delete", {
        data: {
          postId,
          commentId,
          userId: user.result?._id || user._id,
        },
      });

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.delete("/post/delete", {
        data: {
          postId,
          userId: user.result?._id || user._id,
        },
      });

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
    setEditCodeSnippet(post.codeSnippet || "");
    setEditHashtags(post.hashtags?.join(" ") || "");
  };

  const handleUpdate = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.put("/post/edit", {
        postId: editingPostId,
        userId: user.result?._id || user._id,
        content: editContent,
        codeSnippet: editCodeSnippet,
        hashtags: editHashtags
          .split(" ")
          .filter((tag: string) => tag !== ""),
      });

      setEditingPostId("");
      setEditContent("");
      setEditCodeSnippet("");
      setEditHashtags("");

      fetchPosts();
      fetchTrendingPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredPosts = posts.filter((post: any) => {
    const searchText = search.toLowerCase();

    return (
      post.userName?.toLowerCase().includes(searchText) ||
      post.content?.toLowerCase().includes(searchText) ||
      post.hashtags?.some((tag: string) =>
        tag.toLowerCase().includes(searchText)
      )
    );
  });

  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {t("communityFeed")}
          </h1>

          <Link href="/community/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {t("createPost")}
            </button>
          </Link>
        </div>

        <div className="mb-6">
          <Input
            placeholder={t("searchPosts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {trendingPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              📈 {t("trendingPosts")}
            </h2>

            <div className="space-y-3">
              {trendingPosts.map((post: any) => (
                <div
                  key={post._id}
                  className="bg-white border rounded-lg p-4"
                >
                  <h3 className="font-bold">
                    {post.userName}
                  </h3>

                  <p className="mt-1">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      ❤️ {t("like")}
                    </button>

                    <button
                      onClick={() => handleShare(post._id)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      🔗 {t("share")}
                    </button>

                    <button
                      onClick={() => handleReport(post._id)}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      🚩 {t("report")}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    ❤️ {post.likes?.length || 0} {t("likes")}
                    {" · "}
                    💬 {post.comments?.length || 0} {t("comments")}
                    {" · "}
                    🔗 {post.shares?.length || 0} {t("shares")}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleBookmark(post._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      🔖 {t("bookmark")}
                    </button>

                    <span className="text-gray-600 text-sm">
                      {post.bookmarks?.length || 0} {t("saved")}
                    </span>
                  </div>

                  {post.comments?.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <h3 className="font-semibold mb-2">
                        {t("comments")}
                      </h3>

                      {post.comments.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="mb-3 bg-gray-50 p-2 rounded"
                          >
                            {editingCommentId === item._id ? (
                              <div className="mt-2 space-y-2">
                                <Input
                                  value={editComment}
                                  onChange={(e) =>
                                    setEditComment(e.target.value)
                                  }
                                  placeholder={t("editComment")}
                                />

                                <button
                                  onClick={handleUpdateComment}
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                  {t("save")}
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm">
                                <span className="font-semibold">
                                  {item.userName}
                                </span>
                                : {item.comment}
                              </p>
                            )}

                            {(() => {
                              const user =
                                typeof window !== "undefined"
                                  ? JSON.parse(
                                      localStorage.getItem("user") || "{}"
                                    )
                                  : {};

                              const currentUserId =
                                user.result?._id || user._id;

                              return (
                                item.userId?.toString() ===
                                  currentUserId?.toString() && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleEditComment(
                                          post._id,
                                          item._id,
                                          item.comment
                                        )
                                      }
                                      className="text-green-600 text-sm mt-1 hover:underline"
                                    >
                                      {t("edit")}
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteComment(
                                          post._id,
                                          item._id
                                        )
                                      }
                                      className="text-red-600 text-sm mt-1 ml-3 hover:underline"
                                    >
                                      {t("delete")}
                                    </button>
                                  </>
                                )
                              );
                            })()}

                            {item.createdAt && (
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  item.createdAt
                                ).toLocaleString()}
                              </p>
                            )}

                            <button
                              onClick={() =>
                                setReplyCommentId(item._id)
                              }
                              className="text-blue-600 text-sm mt-2 hover:underline"
                            >
                              {t("reply")}
                            </button>

                            {replyCommentId === item._id && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  placeholder={t("writeReply")}
                                  value={replyText}
                                  onChange={(e) =>
                                    setReplyText(e.target.value)
                                  }
                                />

                                <button
                                  onClick={() =>
                                    handleReply(
                                      post._id,
                                      item._id
                                    )
                                  }
                                  className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                                >
                                  {t("reply")}
                                </button>
                              </div>
                            )}

                            {item.replies?.length > 0 && (
                              <div className="ml-8 mt-3 space-y-2">
                                {item.replies.map(
                                  (reply: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="bg-gray-100 rounded p-2"
                                    >
                                      {editingReplyId ===
                                      reply._id ? (
                                        <div className="space-y-2">
                                          <Input
                                            value={editReplyText}
                                            onChange={(e) =>
                                              setEditReplyText(
                                                e.target.value
                                              )
                                            }
                                            placeholder={t(
                                              "editReply"
                                            )}
                                          />

                                          <button
                                            onClick={
                                              handleUpdateReply
                                            }
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                          >
                                            {t("save")}
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <p className="text-sm">
                                            <span className="font-semibold">
                                              {reply.userName}
                                            </span>
                                            : {reply.reply}
                                          </p>

                                          {(() => {
                                            const user =
                                              typeof window !==
                                              "undefined"
                                                ? JSON.parse(
                                                    localStorage.getItem(
                                                      "user"
                                                    ) || "{}"
                                                  )
                                                : {};

                                            const currentUserId =
                                              user.result?._id ||
                                              user._id;

                                            return (
                                              reply.userId?.toString() ===
                                                currentUserId?.toString() && (
                                                <>
                                                  <button
                                                    onClick={() =>
                                                      handleEditReply(
                                                        post._id,
                                                        item._id,
                                                        reply._id,
                                                        reply.reply
                                                      )
                                                    }
                                                    className="text-green-600 text-sm mt-1 hover:underline"
                                                  >
                                                    {t("edit")}
                                                  </button>

                                                  <button
                                                    onClick={() =>
                                                      handleDeleteReply(
                                                        post._id,
                                                        item._id,
                                                        reply._id
                                                      )
                                                    }
                                                    className="text-red-600 text-sm mt-1 ml-3 hover:underline"
                                                  >
                                                    {t("delete")}
                                                  </button>
                                                </>
                                              )
                                            );
                                          })()}
                                        </>
                                      )}

                                      {reply.createdAt && (
                                        <p className="text-xs text-gray-500">
                                          {new Date(
                                            reply.createdAt
                                          ).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            {t("loading")}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-center">
            <p className="text-gray-500">
              {t("noMatchingPosts")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post: any) => (
              <div
                key={post._id}
                className="bg-white border rounded-lg p-5"
              >
                <h2 className="font-bold text-lg">
                  {post.userName}
                </h2>

                {editingPostId === post._id ? (
                  <div className="space-y-3 mt-3">
                    <Input
                      value={editContent}
                      onChange={(e) =>
                        setEditContent(e.target.value)
                      }
                      placeholder={t("content")}
                    />

                    <textarea
                      value={editCodeSnippet}
                      onChange={(e) =>
                        setEditCodeSnippet(e.target.value)
                      }
                      placeholder={t("codeSnippet")}
                      className="w-full border rounded p-2"
                      rows={5}
                    />

                    <Input
                      value={editHashtags}
                      onChange={(e) =>
                        setEditHashtags(e.target.value)
                      }
                      placeholder="#react #node"
                    />

                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      {t("saveChanges")}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mt-2">
                      {post.content}
                    </p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt={t("postImage")}
                        className="w-full max-h-[400px] object-cover rounded-lg mt-4"
                      />
                    )}

                    {post.codeSnippet && (
                      <pre className="bg-gray-100 p-3 rounded mt-3 overflow-x-auto">
                        <code>{post.codeSnippet}</code>
                      </pre>
                    )}
                  </>
                )}

                {editingPostId !== post._id && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {post.hashtags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-blue-600 text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  {new Date(post.createdAt).toLocaleString()}
                </p>

                {(() => {
                  const user =
                    typeof window !== "undefined"
                      ? JSON.parse(
                          localStorage.getItem("user") || "{}"
                        )
                      : {};

                  const currentUserId =
                    user.result?._id || user._id;

                  return (
                    (post.userId?._id || post.userId) ===
                      currentUserId && (
                      <>
                        <button
                          onClick={() => handleEdit(post)}
                          className="mt-3 mr-4 text-green-600 hover:text-green-800 font-medium"
                        >
                          ✏️ {t("editPost")}
                        </button>

                        <button
                          onClick={() => handleDelete(post._id)}
                          className="mt-3 text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ {t("deletePost")}
                        </button>
                      </>
                    )
                  );
                })()}

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    {t("like")}
                  </button>

                  <span className="text-gray-600 text-sm">
                    {post.likes?.length || 0} {t("likes")}
                  </span>

                  <button
                    onClick={() => handleBookmark(post._id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    🔖 {t("bookmark")}
                  </button>

                  <button
                    onClick={() => handleShare(post._id)}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    {t("share")}
                  </button>

                  <span className="text-gray-600 text-sm">
                    {post.bookmarks?.length || 0} {t("saved")}
                  </span>

                  <span className="text-gray-600 text-sm">
                    {post.shares?.length || 0} {t("shares")}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder={t("writeComment")}
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                  />

                  <button
                    onClick={() => handleComment(post._id)}
                    className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
                  >
                    {t("comment")}
                  </button>
                </div>

                {post.comments?.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <h3 className="font-semibold mb-2">
                      {t("comments")}
                    </h3>

                    {post.comments.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="mb-3 bg-gray-50 p-2 rounded"
                        >
                          {editingCommentId === item._id ? (
                            <div className="mt-2 space-y-2">
                              <Input
                                value={editComment}
                                onChange={(e) =>
                                  setEditComment(e.target.value)
                                }
                                placeholder={t("editComment")}
                              />

                              <button
                                onClick={handleUpdateComment}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                {t("save")}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm">
                              <span className="font-semibold">
                                {item.userName}
                              </span>
                              : {item.comment}
                            </p>
                          )}

                          {(() => {
                            const user =
                              typeof window !== "undefined"
                                ? JSON.parse(
                                    localStorage.getItem("user") ||
                                      "{}"
                                  )
                                : {};

                            const currentUserId =
                              user.result?._id || user._id;

                            return (
                              item.userId?.toString() ===
                                currentUserId?.toString() && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleEditComment(
                                        post._id,
                                        item._id,
                                        item.comment
                                      )
                                    }
                                    className="text-green-600 text-sm mt-1 hover:underline"
                                  >
                                    {t("edit")}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteComment(
                                        post._id,
                                        item._id
                                      )
                                    }
                                    className="text-red-600 text-sm mt-1 ml-3 hover:underline"
                                  >
                                    {t("delete")}
                                  </button>
                                </>
                              )
                            );
                          })()}

                          {item.createdAt && (
                            <p className="text-xs text-gray-500">
                              {new Date(
                                item.createdAt
                              ).toLocaleString()}
                            </p>
                          )}

                          <button
                            onClick={() =>
                              setReplyCommentId(item._id)
                            }
                            className="text-blue-600 text-sm mt-2 hover:underline"
                          >
                            {t("reply")}
                          </button>

                          {replyCommentId === item._id && (
                            <div className="mt-2 flex gap-2">
                              <Input
                                placeholder={t("writeReply")}
                                value={replyText}
                                onChange={(e) =>
                                  setReplyText(e.target.value)
                                }
                              />

                              <button
                                onClick={() =>
                                  handleReply(
                                    post._id,
                                    item._id
                                  )
                                }
                                className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                              >
                                {t("reply")}
                              </button>
                            </div>
                          )}

                          {item.replies?.length > 0 && (
                            <div className="ml-8 mt-3 space-y-2">
                              {item.replies.map(
                                (reply: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-100 rounded p-2"
                                  >
                                    {editingReplyId ===
                                    reply._id ? (
                                      <div className="space-y-2">
                                        <Input
                                          value={editReplyText}
                                          onChange={(e) =>
                                            setEditReplyText(
                                              e.target.value
                                            )
                                          }
                                          placeholder={t(
                                            "editReply"
                                          )}
                                        />

                                        <button
                                          onClick={
                                            handleUpdateReply
                                          }
                                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        >
                                          {t("save")}
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="text-sm">
                                          <span className="font-semibold">
                                            {reply.userName}
                                          </span>
                                          : {reply.reply}
                                        </p>

                                        {(() => {
                                          const user =
                                            typeof window !==
                                            "undefined"
                                              ? JSON.parse(
                                                  localStorage.getItem(
                                                    "user"
                                                  ) || "{}"
                                                )
                                              : {};

                                          const currentUserId =
                                            user.result?._id ||
                                            user._id;

                                          return (
                                            reply.userId?.toString() ===
                                              currentUserId?.toString() && (
                                              <>
                                                <button
                                                  onClick={() =>
                                                    handleEditReply(
                                                      post._id,
                                                      item._id,
                                                      reply._id,
                                                      reply.reply
                                                    )
                                                  }
                                                  className="text-green-600 text-sm mt-1 hover:underline"
                                                >
                                                  {t("edit")}
                                                </button>

                                                <button
                                                  onClick={() =>
                                                    handleDeleteReply(
                                                      post._id,
                                                      item._id,
                                                      reply._id
                                                    )
                                                  }
                                                  className="text-red-600 text-sm mt-1 ml-3 hover:underline"
                                                >
                                                  {t("delete")}
                                                </button>
                                              </>
                                            )
                                          );
                                        })()}
                                      </>
                                    )}

                                    {reply.createdAt && (
                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          reply.createdAt
                                        ).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {loadingMore && (
                  <div className="text-center py-5 text-gray-500">
                    {t("loadingMore")}
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-5 text-gray-500">
                    {t("noMorePosts")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}