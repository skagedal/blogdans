import { getAllPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getAllPosts();
  return (
    <div>
      Hello
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
            {/* <span> - {post.date.toLocaleDateString()}</span> */}
            {post.summary && <p>{post.summary}</p>}
          </li>
        ))}
        {posts.length === 0 && <li>No posts found.</li>}
      </ul>
    </div>
  );
}
