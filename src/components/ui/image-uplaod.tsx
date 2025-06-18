"use client";

import React, { useEffect, useState } from "react";

import { Button } from "./button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { Label } from "./label";
import { Input } from "./input";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const BlogImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    try {
      setLoading(true);
      const response = await axios.post(`/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });

      const imageUrl = response.data.imageUrl;
      onChange(imageUrl);
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-5">
      <div className="mb-4 flex items-center justify-center">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[150px] h-[150px] rounded-full overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant={"destructive"}
                size={"icon"}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image alt="upload" fill style={{ objectFit: "cover" }} src={url} />
          </div>
        ))}
      </div>

      <Button type="button" disabled={disabled}>
        <Label className="cursor-pointer flex items-center">
          <ImagePlus className="h-4 w-4 mr-2" />
          {loading ? "Uploading..." : "Upload"}
          <Input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="images/*"
          />
        </Label>
      </Button>
    </div>
  );
};

export default BlogImageUpload;
