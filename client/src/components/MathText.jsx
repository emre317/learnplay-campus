import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/** Markdown + KaTeX ($...$, $$...$$) içerik gösterimi */
export default function MathText({ children, className = '', inline = false }) {
  return (
    <div className={`prose-math ${inline ? '[&>p]:my-0' : ''} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}
