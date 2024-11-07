import ReactMarkdown from 'react-markdown';
import { LoadingMessage } from './LoadingMessage';
import { useEffect, useRef, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { VizModal } from './VizModal';
import { Message } from '@/types/chat';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  vizEnabled: boolean;
}

// Add the function here, before any components
const extractQueryAndResult = (content: string) => {
  const queryMatch = content.match(/```sql\n([\s\S]*?)\n```/);
  const query = queryMatch ? queryMatch[1].trim() : '';
  const resultMatch = content.split('Result:\n');
  const result = resultMatch.length > 1 ? resultMatch[1].trim() : '';
  
  // For debugging
  console.log('Content:', content);
  console.log('Extracted Query:', query);
  console.log('Extracted Result:', result);
  
  return { query, result };
};

// Add this new component above ChatMessages
interface VizControlsProps {
  vizData: string;
}

const VizControls = ({ vizData }: VizControlsProps) => {
  const handleCopy = async () => {
    try {
      // Convert base64 to blob
      const base64Data = vizData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      // Create ClipboardItem and copy image
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    handleCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Convert base64 to blob
    const base64Data = vizData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'visualization.png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopyClick}
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
        {copied ? 'Copied!' : 'Copy Image'}
      </button>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
          bg-white hover:bg-gray-50 text-gray-600 border border-gray-200/50
          transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        Download PNG
      </button>
    </div>
  );
};


interface CopyButtonProps {
  text: string;
  label: string;
  vizData?: string;
  tabularMode?: boolean;
}

const formatTabularData = (text: string): string => {
  // Split into lines and remove empty lines and markdown separators
  const lines = text.split('\n')
    .filter(line => line.trim() && !line.includes('---') && !line.includes('Result:'))
    .map(line => {
      // Remove leading/trailing pipes and split by remaining pipes
      const cells = line.replace(/^\||\|$/g, '').split('|');
      // Clean each cell and ensure consistent spacing
      return cells.map(cell => cell.trim()).join('\t');
    });
  
  return lines.join('\n');
};

const CopyButton = ({ text, label, vizData, tabularMode }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (label === "Copy All") {
        const { query, result } = extractQueryAndResult(text);
        const formattedResult = tabularMode ? formatTabularData(result) : result;
        const allContent = `SQL Query:\n${query}\n\nResult:\n${formattedResult}`;
        
        if (vizData) {
          const htmlContent = `
            <div>
              <pre style="white-space: pre-wrap;">SQL Query:\n${query}\n\nResult:\n${formattedResult}</pre>
              <img src="${vizData}" style="width: 200px; height: auto;" />
            </div>
          `;

          const clipboardData = new ClipboardItem({
            'text/plain': new Blob([allContent], { type: 'text/plain' }),
            'text/html': new Blob([htmlContent], { type: 'text/html' })
          });

          await navigator.clipboard.write([clipboardData]);
        } else {
          await navigator.clipboard.writeText(allContent);
        }
      } else {
        const finalText = tabularMode ? formatTabularData(text) : text;
        await navigator.clipboard.writeText(finalText);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
      {copied ? 'Copied!' : label}
    </button>
  );
};

export const ChatMessages = ({ messages, isLoading, vizEnabled }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedViz, setSelectedViz] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Result
                            </span>
                            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                          </div>
                          <CopyButton 
                            text={message.content}
                            label="Copy All"
                            vizData={message.viz_result}
                            tabularMode={message.tabularMode}
                          />
                        </div>
                      <div className="bg-gray-100/80 rounded-xl p-4 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SQL Query Used
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                        </div>
                        <CopyButton text={query} label="Copy Query" vizData={message.viz_result} tabularMode={message.tabularMode} />
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
                        <CopyButton text={result} label="Copy Result" vizData={message.viz_result} tabularMode={message.tabularMode} />
                      </div>
                        <div className="text-gray-600">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="prose max-w-none"
                            components={{
                              p: ({children}) => {
                                // Check if content is TSV format
                                const text = children?.toString() || '';
                                if (text.includes('\t')) {
                                  const rows = text.split('\n').map(row => row.split('\t'));
                                  return (
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead>
                                        <tr>
                                          {rows[0].map((header, i) => (
                                            <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {rows.slice(1).map((row, i) => (
                                          <tr key={i}>
                                            {row.map((cell, j) => (
                                              <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cell}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  );
                                }
                                return <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{children}</p>;
                              },
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
                          {/* Add visualization display */}
                          {message.viz_result && message.vizEnabledState && (
                              <div className="mt-6 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Visualization
                                  </span>
                                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                                </div>
                                <VizControls vizData={message.viz_result} />
                              </div>
                              <div 
                                className="overflow-hidden rounded-lg border border-gray-100 cursor-pointer
                                  hover:border-blue-200/50 transition-all duration-300 relative group"
                                onClick={() => {
                                  if (message.viz_result) {
                                    setSelectedViz(message.viz_result);
                                  }
                                }}
                              >
                                <img 
                                  src={message.viz_result} 
                                  alt="Data Visualization" 
                                  className="w-full max-w-2xl mx-auto hover:scale-102 transition-transform duration-300"
                                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-600 text-sm bg-white/90 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                                    Click to expand visualization
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-400 mt-2 text-center">
                                Click anywhere on the visualization to view in full screen
                              </p>
                            </div>
                          )}
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
      <VizModal 
        isOpen={!!selectedViz}
        onClose={() => setSelectedViz(null)}
        imageUrl={selectedViz || ''}
      />
    </div>
  );
};