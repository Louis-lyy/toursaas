import Link from "next/link";

type Props = {
  href: string;
  className?: string;
};

export default function PreviewLink({ href, className = "" }: Props) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-sm text-teal-700 hover:text-teal-800 hover:underline ${className}`}
    >
      预览
    </Link>
  );
}
