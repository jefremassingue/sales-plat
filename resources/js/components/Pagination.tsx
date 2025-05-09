import { Link } from '@inertiajs/react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
  return (
    <div className="flex justify-center">
      <nav className="flex items-center gap-1">
        {links.map((link, i) => {
          if (link.url === null) {
            return (
              <span
                key={i}
                className="px-4 py-2 text-sm text-gray-500 bg-white border rounded-md"
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          }

          return (
            <Link
              key={i}
              href={link.url}
              className={`px-4 py-2 text-sm border rounded-md ${
                link.active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          );
        })}
      </nav>
    </div>
  );
} 