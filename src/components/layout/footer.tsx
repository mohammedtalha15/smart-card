import Link from 'next/link';
import React from 'react';

const links = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'History', href: '/history' },
  { title: 'Vendor Portal', href: '/vendor-portal' },
  { title: 'Admin', href: '/admin' },
];

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/dashboard"
          aria-label="go home"
          className="mx-auto block size-fit">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150">
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <span className="text-muted-foreground block text-center text-sm font-mono">
          Artha — Student Discount Network • Built for BMSIT
        </span>
      </div>
    </footer>
  );
}
