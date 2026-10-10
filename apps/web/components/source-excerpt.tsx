import { Response } from '@reforma-digital/design/sol/chat';

export default function SourceExcerpt({ content }: { content: string }) {
  return <Response skipHtml>{content}</Response>;
}
