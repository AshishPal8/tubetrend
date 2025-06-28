import CategorySection from "@/components/home/CategorySection";
import Hero from "@/components/home/hero";
import Trending from "@/components/home/trending";
import { getFeatureBlgs } from "@/lib/api/blogs/getFeaturedBlogs";

export default async function Home() {
  const featuredBlogs = await getFeatureBlgs();

  if (!featuredBlogs) {
    return <div>No blogs found!</div>;
  }

  return (
    <div className="w-full h-screen mt-16 max-w-7xl mx-auto">
      <div className="w-full flex flex-col md:flex-row gap-4 px-2 md:px-0">
        <Hero blogs={featuredBlogs} />
        <Trending />
      </div>
      <div>
        <CategorySection slug="productivity" title="Productivity" />
        <CategorySection slug="self-improvement" title="Self Improvement" />
        <CategorySection slug="internet-culture" title="Internet Culture" />
        <CategorySection slug="lifestyle" title="Lifestyle" />
        <CategorySection slug="careers" title="Careers" />
        <CategorySection slug="technology" title="Technology" />
        <CategorySection slug="ai" title="AI" />
      </div>
    </div>
  );
}
