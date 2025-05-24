import { twMerge } from "tailwind-merge";

export function Paragraph({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`mb-4 leading-6 text-gray-800 dark:text-gray-200 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function H1({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`mt-12 mb-6 text-4xl font-bold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mt-10 mb-5 text-3xl font-semibold ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function H3({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={twMerge("mt-8 mb-4 text-2xl font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h4
      className={`mt-8 mb-3 text-xl font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

export function H5({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h5
      className={`mt-6 mb-3 text-lg font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function H6({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h6
      className={`mt-6 mb-2 text-base font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </h6>
  );
}

export function Anchor({
  children,
  className = "",
  href,
  ...props
}: {
  children?: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      className={`text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline ${className}`}
      href={href}
      {...props}
    >
      {children}
    </a>
  );
}

export function UnorderedList({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={`list-disc mb-4 ml-6 space-y-1 ${className}`} {...props}>
      {children}
    </ul>
  );
}

export function OrderedList({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <ol className={`list-decimal mb-4 ml-6 space-y-1 ${className}`} {...props}>
      {children}
    </ol>
  );
}

export function ListElement({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={`leading-relaxed ${className}`} {...props}>
      {children}
    </li>
  );
}

export function BlockQuote({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <blockquote
      className={`
        my-6 p-4 border-l-4 rounded-md pb-1
        bg-emerald-500/5 border-emerald-300/60 text-emerald-800
        dark:bg-emerald-400/10 dark:border-emerald-500/50 dark:text-emerald-300
        ${className}
      `}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function HorizontalRule({ className = "", ...props }: { className?: string }) {
  return (
    <hr
      className={`my-8 border-t border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    />
  );
}

export function Table({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table
        className={`w-full border-collapse text-left text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={`border-b-2 border-slate-300 dark:border-slate-600 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody
      className={`divide-y divide-slate-200 dark:divide-slate-700 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={`even:bg-slate-50 dark:even:bg-slate-800 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeaderRow({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-4 py-2 ${className}`} {...props}>
      {children}
    </td>
  );
}
