import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const ToolCard = ({ title, description, href, icon: Icon }: ToolCardProps) => (
  <Link href={href} className="card p-6 transition hover:-translate-y-1 hover:border-brand-500">
    <Icon className="mb-4 h-8 w-8 text-brand-500" />
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <p className="text-sm text-slate-300">{description}</p>
  </Link>
);
