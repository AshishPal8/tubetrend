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
  initialLiked?: boolean;
  initialLikeCount?: number;
}

const LikeCommentShare = ({
  id,
  commentCount,
  initialLiked = false,
  initialLikeCount = 0,
}: Props) => {
  const { data: session } = useSession();
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);

  const router = useRouter();

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const toggleLike = async () => {
    if (!session?.user?.id) {
      toast.error("Login to like the blog");
      return;
    }

    const nextLiked = !liked;
    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const res = await axios.post(`/api/blogs/${id}/like`);
      if (
        typeof res.data.liked === "boolean" &&
        typeof res.data.likeCount === "number"
      ) {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      }
    } catch (err) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error("Like toggle failed", err);
      toast.error("Could not update like. Try again.");
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
          aria-pressed={liked}
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

        <button
          className="flex items-center gap-2 transition cursor-pointer"
          aria-label="Share"
        >
          <Share className="text-gray-500" size={30} />
        </button>
      </div>
      <Separator />
    </div>
  );
};

export default LikeCommentShare;
