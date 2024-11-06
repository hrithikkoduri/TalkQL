import ReactMarkdown from 'react-markdown';
import { LoadingMessage } from './LoadingMessage';
import { useEffect, useRef, useState } from 'react';
import remarkGfm from 'remark-gfm';

import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface ChatMessagesProps {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  isLoading: boolean;
}

interface CopyButtonProps {
  text: string;
  label?: string;
}

const CopyButton = ({ text, label }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
        transition-all duration-300 shadow-sm hover:shadow-md
        ${copied 
          ? 'bg-green-50 text-green-600 border border-green-200/50' 
          : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200/50'
        }`}
    >
      {copied ? (
        <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <ClipboardIcon className="h-4 w-4" />
      )}
      {label || 'Copy'}
    </button>
  );
};

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const extractQueryAndResult = (content: string) => {
    const queryMatch = content.match(/```sql\n([\s\S]*?)\n```/);
    const query = queryMatch ? queryMatch[1] : '';
    const result = content.split('Result:\n')[1] || '';
    return { query, result };
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start pl-8'} 
            animate-fade-in px-3`}
        >
          <div className={`max-w-[90%] rounded-2xl ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 p-5 shadow-xl hover:shadow-2xl transition-all duration-200' 
              : 'bg-white/90 backdrop-blur-lg border border-gray-100/50 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-200'
          }`}>
          
            {message.role === 'assistant' ? (
              <div>
                <div className="h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
                <div className="h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
                <div className="p-4 pb-10">
                  {(() => {
                    const { query, result } = extractQueryAndResult(message.content);
                    return (
                      <div className="space-y-6 max-w-[90%] mx-auto">
                      <div className="flex justify-end mb-4">
                        <CopyButton text={`${query}\n\n${result}`} label="Copy All" />
                      </div>
                      <div className="bg-gray-100/80 rounded-xl p-4 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SQL Query Used
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                        </div>
                        <CopyButton text={query} label="Copy Query" />
                      </div>
                      <pre className="relative group rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm font-mono relative">
                          {query.split(' ').map((word, i) => {
                            // SQL Keywords
                            if (/^(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT|RIGHT|INNER|GROUP|BY|ORDER|LIMIT|INSERT|UPDATE|DELETE|SET|HAVING|UNION|ALL|AS|ON|IN|BETWEEN|LIKE|IS|NULL|NOT|DESC|ASC)$/i.test(word)) {
                              return (
                                <span key={i} className="text-indigo-500 font-semibold">
                                  {word}{' '}
                                </span>
                              );
                            }
                            // Numbers
                            else if (/^\d+$/.test(word)) {
                              return (
                                <span key={i} className="text-rose-500 font-medium">
                                  {word}{' '}
                                </span>
                              );
                            }
                            // String literals
                            else if (/^'.*'$/.test(word)) {
                              return (
                                <span key={i} className="text-teal-500 font-medium">
                                  {word}{' '}
                                </span>
                              );
                            }
                            // Special characters and operators
                            else if (/^[;,=<>!]+$/.test(word)) {
                              return (
                                <span key={i} className="text-violet-500 font-medium">
                                  {word}{' '}
                                </span>
                              );
                            }
                            // Table names and other identifiers
                            else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(word)) {
                              return (
                                <span key={i} className="text-blue-500/90 font-medium">
                                  {word}{' '}
                                </span>
                              );
                            }
                            // Default
                            return (
                              <span key={i} className="text-gray-600">
                                {word}{' '}
                              </span>
                            );
                          })}
                        </code>
                      </pre>
                      </div>
                      <div className="bg-gray-100/80 rounded-xl p-4 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Result
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                        </div>
                        <CopyButton text={result} label="Copy Result" />
                      </div>
                        <div className="text-gray-600">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="prose max-w-none"
                            components={{
                              p: ({children}) => (
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{children}</p>
                              ),
                              strong: ({children}) => (
                                <span className="font-semibold text-gray-800 bg-gray-200/50 px-1.5 py-0.5 rounded">
                                  {children}
                                </span>
                              ),
                              li: ({children}) => (
                                <li className="text-gray-600 my-1">{children}</li>
                              ),
                              ul: ({children}) => (
                                <ul className="list-disc pl-4 my-2">{children}</ul>
                              )
                            }}
                          >
                            {result}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-white">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-invert max-w-none prose-p:text-white 
                    prose-headings:text-white prose-strong:text-white prose-p:leading-relaxed"
                  components={{
                    strong: ({children}) => (
                      <span className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded">
                        {children}
                      </span>
                    ),
                    p: ({children}) => (
                      <p className="text-white whitespace-pre-wrap leading-relaxed">{children}</p>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
      {isLoading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </div>
  );
};