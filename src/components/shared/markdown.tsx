import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MarkdownProps } from "@/types/content";

// Problem statements and other admin-written Markdown, styled with theme tokens. Raw HTML is not rendered.
export function Markdown({ children }: MarkdownProps) {
  return (
    <div className="text-foreground space-y-3 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="font-heading mt-4 text-lg font-semibold">{children}</h3>,
          h2: ({ children }) => <h3 className="font-heading mt-4 text-base font-semibold">{children}</h3>,
          h3: ({ children }) => <h4 className="mt-3 font-semibold">{children}</h4>,
          p: ({ children }) => <p className="text-pretty">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
              {children}
            </a>
          ),
          code: ({ children }) => <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]">{children}</code>,
          pre: ({ children }) => <pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
          table: ({ children }) => <table className="w-full border-collapse text-left text-sm [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1">{children}</table>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
