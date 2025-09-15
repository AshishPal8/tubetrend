"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

interface Comment {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    avatar: string;
    email: string;
    name: string;
  };
}

const BlogComment = ({ id }: { id: number }) => {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/blogs/${id}/comment`);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        toast.error("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  const postComment = useCallback(async () => {
    if (!session?.user?.id) {
      toast.error("Please login to comment");
      return;
    }

    if (newComment.trim().length < 2) {
      toast.error("Comment too short");
      return;
    }

    if (isPosting) return;

    setIsPosting(true);
    const tempComment = newComment;

    try {
      const res = await axios.post(
        `/api/blogs/${id}/comment`,
        { comment: tempComment },
        { withCredentials: true }
      );

      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
      toast.success("Comment posted");

      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Failed to post comment", err);
      toast.error("Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  }, [session?.user?.id, newComment, id, isPosting]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        postComment();
      }
    },
    [postComment]
  );

  if (isLoading) {
    return (
      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="comment" className="mt-16 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>

      {session?.user?.id && (
        <div className="flex flex-col gap-3 mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your comment... (Ctrl+Enter to post)"
            className="w-full p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            maxLength={1000}
            disabled={isPosting}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {newComment.length}/1000 characters
            </span>
            <button
              onClick={postComment}
              disabled={isPosting || newComment.trim().length < 2}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      )}

      {!session?.user?.id && status !== "loading" && (
        <p className="text-gray-500 mb-5">
          To add comment{" "}
          <span className="text-blue-500 font-medium hover:underline">
            <Link href="/signin">Sign in</Link>
          </span>
        </p>
      )}

      {comments.length === 0 && !isLoading && (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      )}

      <div className="space-y-4 mb-5">
        {comments.map((c, index) => (
          <div
            key={c.id}
            className="p-4 bg-gray-100 rounded-md transition-all hover:bg-gray-50"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={c.user.avatar || ""}
                  alt={c.user.name}
                  loading="lazy"
                />
                <AvatarFallback className="text-xs">
                  {c.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{c.user.name}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(c.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
            <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">
              {c.content}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default BlogComment;
