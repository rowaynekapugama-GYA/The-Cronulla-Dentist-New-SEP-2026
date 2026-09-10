import Link from 'next/link';

export function Breadcrumb({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((it, i) =>
          i === items.length - 1 ? (
            <li key={it.href} aria-current="page">
              {it.name}
            </li>
          ) : (
            <li key={it.href}>
              <Link href={it.href}>{it.name}</Link>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
