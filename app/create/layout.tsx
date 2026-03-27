import { redirect } from 'next/navigation';

export default function CreateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  void children;
  redirect('/dashboard');
}
