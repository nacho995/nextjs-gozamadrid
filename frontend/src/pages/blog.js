import BlogPage from "@/components/blog/blogPage";





export default function BlogComponent() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "url('/gozamadridwp2.jpg')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      <BlogPage />
    </>
  );
}




