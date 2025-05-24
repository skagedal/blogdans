import { Post } from "@/lib/posts";
import { Next, Prev } from "./prev-next";
import { SiGithub, SiBluesky } from "react-icons/si";

export function Footer({ previous, next }: { previous?: Post; next?: Post }) {
  return (
    <footer className="mt-4 py-4 items-center flex flex-col gap-4 mb-2">
      {previous || next ? (
        <div className="flex justify-between border-t border-b border-gray-200 gap-4 w-full">
          {previous ? (
            <Prev url={previous.slug} title={previous.title} />
          ) : (
            <div className="w-1/2 max-w-xs" />
          )}
          {next ? (
            <Next url={next.slug} title={next.title} />
          ) : (
            <div className="w-1/2 max-w-xs" />
          )}
        </div>
      ) : <div className="w-full border-t  border-gray-200" />}
      <div className="">
        Simon Kågedal Reimer &lt;skagedal@gmail.com&gt;
      </div>
      <SocialLinks />
    </footer>
  );
}

export default function SocialLinks() {
  return (
    <nav className="flex gap-2 text-2xl">
      <a href="https://github.com/skagedal">
        <SiGithub />
      </a>
      <a href="https://bsky.app/profile/skagedal.tech">
        <SiBluesky />
      </a>
    </nav>
  );
}
