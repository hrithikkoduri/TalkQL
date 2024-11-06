interface ChatLayoutProps {
    children: React.ReactNode;
  }
  
  export const ChatLayout = ({ children }: ChatLayoutProps) => (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        {children}
      </div>
    </main>
  );