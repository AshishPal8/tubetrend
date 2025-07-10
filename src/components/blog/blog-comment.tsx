"use client";
import axios from "axios";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  const { data: session } = useSession();
  console.log(session?.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await axios.get(`/api/blogs/${id}/comment`);
      const data = await res.data.comments;
      setComments(data);
    };

    fetchComments();
  }, [id]);

  const postComment = async () => {
    if (!session?.user?.id) return toast.error("Please login to comment");
    if (newComment.length < 2) return toast.error("Comment too short");

    try {
      const res = await axios.post(
        `/api/blogs/${id}/comment`,
        {
          comment: newComment,
        },
        {
          withCredentials: true,
        }
      );
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
      toast.success("Comment posted");
      setTimeout(
        () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } catch (err) {
      console.log("Failed to post comment", err);
      toast.error("Failed to post comment");
    }
  };

  return (
    <div id="comment" className="mt-16 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>

      {session?.user?.id && (
        <div className="flex flex-col gap-3 mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full p-3 border rounded-md resize-none"
            rows={3}
          />
          <button
            onClick={postComment}
            className="self-end bg-primary text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
          >
            Post Comment
          </button>
        </div>
      )}

      {!session?.user.id && (
        <p className="text-gray-500 mb-5">
          To add comment{" "}
          <span className="text-blue-500 font-medium">
            <Link href="/signin">Sign in</Link>
          </span>
        </p>
      )}

      {comments.length === 0 && (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      )}

      <div className="space-y-4 mb-5">
        {comments.map((c) => (
          <div key={c.id} className="p-4 bg-gray-100 rounded-md">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={c.user.avatar || ""} alt={c.user.name} />
                <AvatarFallback className="text-xs">
                  {c.user.name?.[0]?.toUpperCase() || "B"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{c.user.name}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(c.createdAt), "MM/dd/yyyy")}
                </p>
              </div>
            </div>
            <p className="text-gray-800 text-sm">{c.content}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default BlogComment;
