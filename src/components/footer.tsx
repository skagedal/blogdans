import { Post } from "@/lib/posts";
import { Next, Prev } from "./prev-next";
import { SiGithub, SiBluesky } from "react-icons/si";
import { RssIcon } from "lucide-react";

export function Footer({ previous, next }: { previous?: Post; next?: Post }) {
  return (
    <footer className="mt-4 py-4 items-center flex flex-col gap-4 mb-6">
      {previous || next ? (
        <div className="flex justify-between border-t border-b gap-4 w-full">
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
      ) : (
        <div className="w-full border-t" />
      )}
      <div className="text-muted-foreground">Simon Kågedal Reimer &lt;skagedal@gmail.com&gt;</div>
      <SocialLinks />
    </footer>
  );
}

export default function SocialLinks() {
  return (
    <nav className="flex gap-2 text-2xl text-muted-foreground">
      <a href="https://github.com/skagedal">
        <SiGithub />
      </a>
      <a href="https://bsky.app/profile/skagedal.tech">
        <SiBluesky />
      </a>
      <a href="/feed.xml">
        <RssIcon />
      </a>
    </nav>
  );
}
