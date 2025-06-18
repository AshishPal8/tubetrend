import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("media") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const compressedBuffer = await sharp(buffer)
    .resize({ width: 1200 })
    .jpeg({ quality: 75 })
    .toBuffer();

  const uploadResponse = await imageKit.upload({
    file: compressedBuffer,
    fileName: `${Date.now()}-${file.name}`,
    folder: "/blogs",
  });

  return NextResponse.json({
    imageUrl: uploadResponse.url,
    filePath: uploadResponse.filePath,
  });
}
