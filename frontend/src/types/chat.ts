interface Message {
    role: 'user' | 'assistant';
    content: string;
    viz_result?: string;
    vizEnabledState?: boolean;
    tabularMode?: boolean;
  }
  
  export type { Message };