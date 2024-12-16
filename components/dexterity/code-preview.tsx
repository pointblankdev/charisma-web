import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Code, ChevronUp, ChevronDown } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';

interface CodePreviewProps {
  code: string;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export function CodePreview({ code, showPreview, onTogglePreview }: CodePreviewProps) {
  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onTogglePreview} className="w-full">
        <Code className="w-4 h-4 mr-2" />
        {showPreview ? 'Hide' : 'Show'} Contract Code
        {showPreview ? (
          <ChevronUp className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </Button>

      {showPreview && (
        <Card>
          <div className="p-4 bg-black rounded-lg">
            <SyntaxHighlighter
              language="lisp"
              customStyle={{
                background: 'black',
                margin: 0,
                fontSize: '0.875rem'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </Card>
      )}
    </div>
  );
}
