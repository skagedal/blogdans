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

  const links: React.ReactNode[] = [];
  if (hackernews) {
    links.push(
      <Anchor key="hn" href={hackernews}>
        Hacker News
      </Anchor>
    );
  }
  if (bluesky) {
    links.push(
      <Anchor key="bsky" href={bluesky}>
        Blue Sky
      </Anchor>
    );
  }
  if (linkedin) {
    links.push(
      <Anchor key="li" href={linkedin}>
        Linked In
      </Anchor>
    );
  }

  const joined: React.ReactNode[] = [];
  links.forEach((link, i) => {
    if (i > 0) {
      const sep = i === links.length - 1 ? " or " : ", ";
      joined.push(<span key={`sep-${i}`}>{sep}</span>);
    }
    joined.push(link);
  });

  return (
    <p className="mb-6 text-muted-foreground">
      Discuss this post on {joined}.
    </p>
  );
}
