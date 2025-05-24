export function Prev({ url, title }: { url: string; title: string }) {
  return (
    <a
      href={`/posts/${url}`}
      className="flex items-center rounded-lg hover:bg-gray-100 transition-colors px-4 py-3 w-1/2 max-w-xs mb-0 text-gray-800 no-underline min-h-[56px]"
      style={{ justifyContent: "flex-start" }}
    >
      <LeftArrow />
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
      <RightArrow />
    </a>
  );
}

function LeftArrow() {
  return (
    <span className="mr-2 flex-shrink-0" aria-label="Previous post">
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 16l-5-6 5-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function RightArrow() {
  return (
    <span className="flex-shrink-0" aria-label="Next post">
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 4l5 6-5 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
