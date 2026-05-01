type Props = {
  hackernews?: string;
  bluesky?: string;
};

export function DiscussLinks({ hackernews, bluesky }: Props) {
  if (!hackernews && !bluesky) {
    return null;
  }

  const links: React.ReactNode[] = [];
  if (hackernews) {
    links.push(
      <a key="hn" href={hackernews} className="underline">
        Hacker News
      </a>
    );
  }
  if (bluesky) {
    links.push(
      <a key="bsky" href={bluesky} className="underline">
        Blue Sky
      </a>
    );
  }

  const joined: React.ReactNode[] = [];
  links.forEach((link, i) => {
    if (i > 0) joined.push(<span key={`sep-${i}`}> or </span>);
    joined.push(link);
  });

  return (
    <p className="mb-6 text-muted-foreground">
      Discuss this post on {joined}.
    </p>
  );
}
