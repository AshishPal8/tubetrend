"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, MessageCircle, Share } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Props {
  id: number;
  commentCount: number;
  initialLikeCount?: number;
  slug: string;
}

const LikeCommentShare = ({
  id,
  commentCount,
  initialLikeCount = 0,
  slug,
}: Props) => {
  const { data: session } = useSession();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [realTimeCommentCount, setRealTimeCommentCount] =
    useState<number>(commentCount);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const router = useRouter();

  // Load real-time data on client-side
  useEffect(() => {
    const loadRealTimeData = async () => {
      try {
        const response = await axios.get(`/api/blogs/${id}/stats`);
        const {
          likeCount: currentLikes,
          commentCount: currentComments,
          userLiked,
        } = response.data;

        setLikeCount(currentLikes);
        setRealTimeCommentCount(currentComments);
        setLiked(userLiked || false);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load real-time stats:", error);
        setIsLoaded(true);
      }
    };

    if (session !== undefined) {
      loadRealTimeData();
    }
  }, [id, session]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        await axios.post(`/api/blogs/${id}/view`);
      } catch (error) {
        console.error("Failed to increment view:", error);
      }
    };

    incrementView();
  }, [id]);

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

        await axios.post(`/api/revalidate?path=/p/${slug}`);
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

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="mt-4">
      <Separator />
      <div className="flex gap-6 items-center my-2">
        <button
          className="flex items-center gap-2 transition cursor-pointer hover:scale-105"
          onClick={toggleLike}
          aria-pressed={liked}
          disabled={!isLoaded}
        >
          <Heart
            size={30}
            className={liked ? "text-red-500 fill-red-500" : "text-gray-500"}
          />
          <span className={!isLoaded ? "animate-pulse" : ""}>{likeCount}</span>
        </button>

        <button
          className="flex items-center gap-2 transition cursor-pointer hover:scale-105"
          onClick={handleComment}
        >
          <MessageCircle className="text-gray-500" size={30} />
          <span className={!isLoaded ? "animate-pulse" : ""}>
            {realTimeCommentCount}
          </span>
        </button>

        <button
          className="flex items-center gap-2 transition cursor-pointer hover:scale-105"
          onClick={shareUrl}
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
