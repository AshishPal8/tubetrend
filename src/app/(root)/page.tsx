import Image from "next/image";

export default function Home() {
  return (
    <div className="text-4xl bg-blue-600 h-[4000px]">
      <Image src="/mountain.jpg" alt="mountain" width={1500} height={500} />
    </div>
  );
}
