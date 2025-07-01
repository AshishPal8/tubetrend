"use client";
import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Share } from "lucide-react";
import { Separator } from "../ui/separator";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
  commentCount: number;
}

const LikeCommentShare = ({ id, commentCount }: Props) => {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchLiked = async () => {
      const res = await axios.get(`/api/blogs/${id}/like`);
      const data = await res.data;
      setLiked(data.liked || false);
      setLikeCount(data.likeCount || 0);
    };

    fetchLiked();
  }, [id]);

  const toggleLike = async () => {
    if (!session?.user?.id) return toast.error("Login to like the blog");

    try {
      const res = await axios.post(`/api/blogs/${id}/like`);
      setLiked(res.data.liked);
      setLikeCount((prev) => (res.data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.log("something went wrong", err);
      toast.error("Something went wrong");
    }
  };

  const handleComment = () => {
    router.push("#comment");
  };

  return (
    <div className="mt-4">
      <Separator />
      <div className="flex gap-6 items-center my-2">
        <button
          className="flex items-center gap-2 transition cursor-pointer"
          onClick={toggleLike}
        >
          <Heart
            size={30}
            className={liked ? "text-primary fill-primary" : ""}
          />
          <span>{likeCount}</span>
        </button>
        <button
          className="flex items-center gap-2 transition cursor-pointer"
          onClick={handleComment}
        >
          <MessageCircle className="text-gray-500" size={30} />
          <span>{commentCount}</span>
        </button>
        <button className="flex items-center gap-2 transition cursor-pointer">
          <Share className="text-gray-500" size={30} />
        </button>
      </div>
      <Separator />
    </div>
  );
};

export default LikeCommentShare;
