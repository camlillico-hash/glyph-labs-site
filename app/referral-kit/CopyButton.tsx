"use client";

export default function CopyButton({
  text,
  className,
  children = "Copy",
}: {
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className={className}
    >
      {children}
    </button>
  );
}
