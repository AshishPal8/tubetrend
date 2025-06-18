"use client";

import React, { useState } from "react";
import axios from "axios";
import { ImagePlus } from "lucide-react";

interface Props {
  onUploadComplete: (url: string) => void;
}

const BlogImageUploadInline: React.FC<Props> = ({ onUploadComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    try {
      setLoading(true);
      const res = await axios.post(`/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = res.data.imageUrl;
      onUploadComplete(imageUrl);
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={loading}
      />
      <ImagePlus className="h-4 w-4" />
    </label>
  );
};

export default BlogImageUploadInline;
