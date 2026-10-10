import { Fragment } from "react";
import { Anchor } from "@/components/ui/typography";

type Props = {
  hackernews?: string;
  bluesky?: string;
  linkedin?: string;
};

export function DiscussLinks({ hackernews, bluesky, linkedin }: Props) {
  if (!hackernews && !bluesky && !linkedin) {
    return null;
  }

  const links = [
    { key: "hn", href: hackernews, label: "Hacker News" },
    { key: "bsky", href: bluesky, label: "Blue Sky" },
    { key: "li", href: linkedin, label: "Linked In" },
  ].filter((link): link is typeof link & { href: string } => !!link.href);

  const joined = links.map(({ key, href, label }, i) => (
    <Fragment key={key}>
      {i > 0 && (i === links.length - 1 ? " or " : ", ")}
      <Anchor href={href}>{label}</Anchor>
    </Fragment>
  ));

  return (
    <p className="mb-6 text-muted-foreground">
      Discuss this post on {joined}.
    </p>
  );
}
