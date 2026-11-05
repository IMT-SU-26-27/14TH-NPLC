// Room at the bottom of every contest page so the floating guide button never covers the last content.
export default function CpLayout({ children }: LayoutProps<"/[lang]/cp">) {
  return <div className="flex flex-1 flex-col pb-20 sm:pb-24">{children}</div>;
}
