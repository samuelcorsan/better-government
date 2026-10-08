import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SourceExcerpt({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        a: ({ children: text }) => <span>{text}</span>,
        img: () => null,
        input: () => null,
      }}
    >
      {content}
    </Markdown>
  );
}
