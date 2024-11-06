export interface Message {
  role: 'user' | 'assistant';
  content: string;
  viz_result?: string;
  vizEnabledState?: boolean;
} 