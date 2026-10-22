import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState,useRef } from "react";
import { toast } from "react-toastify";

const index = () => {
  const { user } = useAuth();
  const router = useRouter();
  const postId = router.query.postId as string;  
  const { id } = router.query;
  const profileId = Array.isArray(id) ? id[0] : id;
  const currentUserId = user?._id;
  const isOwnProfile = profileId === currentUserId;
  const [users, setusers] = useState<any>(null);
  const [reputationHistory, setReputationHistory] = useState<any[]>([]);
  const [reputationLoading, setReputationLoading] = useState(false);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    about: string;
    tags: string[];
    language: string;
  }>({
    name: "",
    about: "",
    tags: [],
    language: "en",
  });
  const [newTag, setNewTag] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const postRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activePostId, setActivePostId] = useState("");
  const [postsLoading, setPostsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [highlightPostId, setHighlightPostId] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<string | null>(null);
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(null);
  
  useEffect(() => {
    if (postId) {
      setActivePostId(postId);
      setHighlightPostId(postId);
    }
  }, [postId]);
  const fetchReputationHistory = async () => {
    try {
      setReputationLoading(true);

      const res = await axiosInstance.get(
        `/api/reputation-history/${profileId}`
      );

      setReputationHistory(res.data.history || []);
    } catch (error) {
      console.log("Reputation History Error:", error);
    } finally {
      setReputationLoading(false);
    }
  };
  const fetchFollowersFollowing = async () => {
    try {
      const res = await axiosInstance.get(`/user/followers/${profileId}`);

      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchActiveSessions = async () => {
    try {
      setSessionsLoading(true);

      const res = await axiosInstance.get("/user/sessions");

      setActiveSessions(res.data.data || []);
    } catch (error) {
      console.log("Active Sessions Error:", error);
    } finally {
      setSessionsLoading(false);
    }
  };
  const fetchUserPosts = async () => {
    try {
      const res = await axiosInstance.get("/post/all");
      const allPosts = res.data.data || [];

      const filteredPosts = allPosts.filter(
        (post: any) =>
          post.userId === profileId || post.userId?._id === profileId
      );

      setUserPosts(filteredPosts);
    } catch (error) {
      console.log(error);
    } finally {
      setPostsLoading(false);
    }
  };
  
  useEffect(() => {
    if (postId && postRefs.current[postId as string]) {
      postRefs.current[postId as string]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [postId, userPosts]);

  useEffect(() => {
    if (router.query.type) {
      setNotificationType(router.query.type as string);
    }
  }, [router.query.type]);

  useEffect(() => {
    if (router.query.commentId) {
      setHighlightCommentId(router.query.commentId as string);
    }
  }, [router.query.commentId]);

  useEffect(() => {
    if (!router.isReady || userPosts.length === 0) return;

    const { postId } = router.query;

    if (postId) {
      setTimeout(() => {
        const element = document.getElementById(postId as string);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  }, [router.isReady, router.query, userPosts]);
  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find(
          (u: any) => u._id === profileId
        );
        setusers(matcheduser);
        if (matcheduser) {
          setEditForm({
            name: matcheduser.name || "",
            about: matcheduser.about || "",
            tags: matcheduser.tags || [],
            language: matcheduser.language || "en",
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
    const fetchPayments = async () => {
    try {
      const res = await axiosInstance.get(`/payment/history/${profileId}`);
      setPayments(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  
  if (profileId) {
    fetchPayments();
    fetchUserPosts();
    fetchFollowersFollowing();
    fetchReputationHistory();

    if (isOwnProfile) {
      fetchActiveSessions();
    }
  }
  }, [id, currentUserId]);
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!users) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-10">
          No user found.
        </div>
      </Mainlayout>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm: {
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
          language: editForm.language,
        },
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
          language: editForm.language,
        };

        setusers(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const handleFollow = async () => {
    try {
      console.log("Before API");

      const res = await axiosInstance.patch("/user/follow", {
        currentUserId,
        targetUserId: profileId,
      });

      console.log("After API");
      console.log(res.data);
      const updatedUser = await axiosInstance.get("/user/getalluser");

      const matchedUser = updatedUser.data.data.find(
        (u: any) => u._id === profileId
      );

      setusers(matchedUser);
    } catch (error: any) {
      console.log("Catch");
      console.log(error);
      console.log(error.response);
    }
  };
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await axiosInstance.patch(
        `/user/sessions/${sessionId}/revoke`
      );

      if (res.data.success) {
        setActiveSessions((prev) =>
          prev.filter((session) => session.sessionId !== sessionId)
        );

        toast.success("Session revoked successfully");
      }
    } catch (error: any) {
      console.log("Revoke Session Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to revoke session"
      );
    }
  };
  
  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl">
              {users.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {users.name}
                </h1>
              </div>
              {!isOwnProfile && (
                <Button
                  onClick={handleFollow}
                  className="mt-3"
                >
                 {users.followers?.some(
                  (id: any) => id.toString() === currentUserId?.toString()
                )
                  ? "Unfollow"
                  : "Follow"}
                </Button>
              )}

              <div className="flex gap-6 mt-3 text-sm text-gray-600">
                <span
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => setOpenFollowers(true)}
                >
                  <b>{users.followers?.length || 0}</b> Followers
                </span>

                <span
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => setOpenFollowing(true)}
                >
                  <b>{users.following?.length || 0}</b> Following
                </span>
              </div>
              <Dialog open={openFollowers} onOpenChange={setOpenFollowers}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                  </DialogHeader>

                  {followers.length === 0 ? (
                    <p>No Followers</p>
                  ) : (
                    followers.map((f: any) => (
                      <div key={f._id}>
                        {f.name}
                      </div>
                    ))
                  )}
                </DialogContent>
              </Dialog>
              <Dialog open={openFollowing} onOpenChange={setOpenFollowing}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Following</DialogTitle>
                  </DialogHeader>

                  {following.length === 0 ? (
                    <p>Not Following Anyone</p>
                  ) : (
                    following.map((f: any) => (
                      <div
                        key={f._id}
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                        onClick={() => {
                          setOpenFollowing(false);
                          router.push(`/users/${f._id}`);
                        }}
                      >
                        {f.name}
                      </div>
                    ))
                  )}
                </DialogContent>
              </Dialog>
              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Your display name"
                            />
                          </div>
                        </div>
                      </div>
                      {/* About Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">About</h3>
                        <div>
                          <Label htmlFor="about">About Me</Label>
                          <Textarea
                            id="about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                about: e.target.value,
                              })
                            }
                            placeholder="Tell us about yourself, your experience, and interests..."
                            className="min-h-32"
                          />
                        </div>
                      </div>

                      {/* Tags/Skills Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Skills & Technologies
                        </h3>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill or technology"
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleAddTag()
                              }
                            />
                            <Button
                              onClick={handleAddTag}
                              variant="outline"
                              size="sm"
                              className="bg-orange-600 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: any) => {
                              return (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800 flex items-center gap-1"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="bg-white text-gray-800 hover:text-gray-900"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{" "}
                {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
            </div>
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                Reputation
              </span>

              <div className="text-2xl font-bold text-gray-800">
                {users.reputation || 0}
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">5</span>
                <span className="text-gray-600 ml-1">gold badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-semibold">23</span>
                <span className="text-gray-600 ml-1">silver badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                <span className="font-semibold">45</span>
                <span className="text-gray-600 ml-1">bronze badges</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

            <div className="flex justify-between">
            <span>Current Plan</span>

            <Badge
              className={
                users.subscription?.plan === "Gold"
                  ? "bg-yellow-500 text-white"
                  : users.subscription?.plan === "Silver"
                  ? "bg-gray-500 text-white"
                  : users.subscription?.plan === "Bronze"
                  ? "bg-orange-500 text-white"
                  : "bg-green-500 text-white"
                }
              >
                {users.subscription?.plan}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Status</span>
              <span>{users.subscription?.status}</span>
            </div>

            <div className="flex justify-between">
              <span>Badge</span>
              <span>{users.subscription?.badge}</span>
            </div>

            <div className="flex justify-between">
              <span>Start Date</span>

              <span>
                {users.subscription?.startDate
                  ? new Date(users.subscription.startDate).toLocaleDateString()
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Renewal</span>

              <span>
                {users.subscription?.renewalDate
                  ? new Date(users.subscription.renewalDate).toLocaleDateString()
                  : "-"}
              </span>
            </div>

          </CardContent>
        </Card>
        {isOwnProfile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>

            <CardContent>
              {sessionsLoading ? (
                <div className="text-center py-6">
                  Loading active sessions...
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  No active sessions found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session: any) => (
                    <div
                      key={session.sessionId}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-800">
                            {session.deviceType} - {session.browser}
                          </h3>

                          <p className="text-sm text-gray-600">
                            OS: {session.operatingSystem}
                          </p>

                          <p className="text-sm text-gray-600">
                            IP Address: {session.ipAddress}
                          </p>

                          <p>
                            Location: {session.location || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Login:{" "}
                            {new Date(session.loginTime).toLocaleString()}
                          </p>

                          <p className="text-sm text-gray-600">
                            Last Activity:{" "}
                            {new Date(session.lastActivity).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-start">
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleRevokeSession(session.sessionId)
                            }
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="w-full mt-6">
              <CardHeader>
                <CardTitle>Reputation Activity</CardTitle>
              </CardHeader>

              <CardContent>
                {reputationLoading ? (
                  <div className="text-center py-6">
                    Loading reputation activity...
                  </div>
                ) : reputationHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">
                    No reputation activity found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reputationHistory.map((activity: any) => (
                      <div
                        key={activity._id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {activity.reason}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`font-semibold ${
                            activity.type === "earned"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {activity.type === "earned" ? "+" : "-"}
                          {activity.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          <div className="mt-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>User Posts</CardTitle>
              </CardHeader>

              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-6">Loading posts...</div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">
                    No posts found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post: any) => (
                          <div
                            id={post._id}
                            key={post._id}
                            ref={(el) => {
                              postRefs.current[post._id] = el;
                            }}
                            className={`border rounded-lg p-4 transition-all duration-300 ${
                              activePostId === post._id
                                ? "border-orange-500 bg-orange-50 shadow-lg"
                                : "bg-white"
                            }`}
                          >
                            {highlightPostId === post._id && (
                              <div className="mb-2 text-sm font-medium text-blue-600">
                                {notificationType === "like"
                                  ? "❤️ Someone liked this post"
                                  : "💬 Someone commented on this post"}
                              </div>
                            )}
                            <p className="font-medium">{post.content}</p>

                            {post.image && (
                              <img
                                src={post.image}
                                className="w-full rounded-lg mt-3"
                              />
                            )}

                            {post.codeSnippet && (
                              <pre className="bg-gray-100 p-3 rounded mt-3 overflow-x-auto">
                                <code>{post.codeSnippet}</code>
                              </pre>
                            )}

                            <div className="flex gap-2 mt-3 flex-wrap">
                              {post.hashtags?.map((tag: string) => (
                                <span key={tag} className="text-blue-600 text-sm">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-5 mt-3 text-sm text-gray-600">
                              <span>❤️ {post.likes?.length || 0}</span>
                              <span>💬 {post.comments?.length || 0}</span>
                              <span>🔖 {post.bookmarks?.length || 0}</span>
                            </div>
                            {/* Comments */}
                            {post.comments?.length > 0 && (
                              <div className="mt-4 border-t pt-3">
                                <h4 className="text-sm font-semibold mb-2">
                                  Comments ({post.comments.length})
                                </h4>

                                <div className="space-y-2">
                                  {post.comments.map((comment: any) => (
                                    <div
                                      key={comment._id}
                                      className={`p-2 rounded-md transition-all ${
                                        router.query.commentId?.toString() === comment._id?.toString()
                                          ? "bg-yellow-200 border border-yellow-500"
                                          : "bg-gray-100"
                                      }`}
                                    >
                                      <p className="text-sm">
                                        <span className="font-semibold">
                                          {comment.userName}
                                        </span>
                                      </p>

                                      <p className="text-sm text-gray-700">
                                        {comment.comment}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(post.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      )}
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;
