import { ChevronLeft, ChevronRight } from "lucide-react";

export function Prev({ url, title }: { url: string; title: string }) {
  return (
    <a
      href={`/posts/${url}`}
      className="flex items-center rounded-lg hover:bg-gray-100 transition-colors px-4 py-3 w-1/2 max-w-xs mb-0 text-gray-800 no-underline min-h-[56px]"
      style={{ justifyContent: "flex-start" }}
    >
      <ChevronLeft />
      <span className="break-words whitespace-normal">{title}</span>
    </a>
  );
}

export function Next({ url, title }: { url: string; title: string }) {
  return (
    <a
      href={`/posts/${url}`}
      className="flex items-center rounded-lg  hover:bg-gray-100 transition-colors px-4 py-3 w-1/2 max-w-xs mb-0 text-gray-800 no-underline min-h-[56px]"
      style={{ justifyContent: "flex-end" }}
    >
      <span className="break-words whitespace-normal mr-2">{title}</span>
      <ChevronRight />
    </a>
  );
}

