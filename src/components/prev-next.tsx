import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropsWithChildren } from "react";

function PrevNextLink({
  url,
  style,
  children,
}: PropsWithChildren<{ url: string; style: React.CSSProperties }>) {
  return (
    <a
      href={`/posts/${url}`}
      className="flex items-center rounded-lg text-muted-foreground hover:bg-muted transition-colors px-4 py-3 w-1/2 max-w-xs mb-0 no-underline min-h-[56px]"
      style={style}
    >
      {children}
    </a>
  );
}

export function Prev({ url, title }: { url: string; title: string }) {
  return (
    <PrevNextLink url={url} style={{ justifyContent: "flex-start" }}>
      <ChevronLeft />
      <span className="break-words whitespace-normal">{title}</span>
    </PrevNextLink>
  );
}

export function Next({ url, title }: { url: string; title: string }) {
  return (
    <PrevNextLink url={url} style={{ justifyContent: "flex-end" }}>
      <span className="break-words whitespace-normal mr-2">{title}</span>
      <ChevronRight />
    </PrevNextLink>
  );
}
