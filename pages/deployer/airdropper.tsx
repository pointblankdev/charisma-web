import { uniq, uniqBy } from 'lodash';
import { UploadCloud } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const MAX_LIST_LENGTH = 200;
const DEFAULT_TOKEN_AMOUNT = 5000000;

const generateTemplate = (parsedAddresses: any[]) => {
  const chunkedAddresses = chunkArray(parsedAddresses, MAX_LIST_LENGTH);
  const wrappedChunks = chunkedAddresses
    .map(chunk => {
      const addressList = chunk
        .map(item => `   {to: '${item.address}, amount: u${item.amount}, memo: none}`)
        .join('\n');

      return `(contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma send-many (list
${addressList}
))
`;
    })
    .join('\n');

  return `${wrappedChunks}`;
};

const generateTemplateSip13 = (parsedAddresses: any[]) => {
  const chunkedAddresses = chunkArray(parsedAddresses, MAX_LIST_LENGTH);
  const wrappedChunks = chunkedAddresses
    .map(chunk => {
      const addressList = chunk
        .map(item => `   {token-id: u1, amount: u${item.amount}, sender: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS, recipient: '${item.address}}`)
        .join('\n');

      return `(contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands transfer-many (list
${addressList}
))
`;
    })
    .join('\n');

  return `${wrappedChunks}`;
};

const chunkArray = (array: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export default function AirdropTemplate({
  onFormChange
}: {
  onFormChange: (template: string) => void;
}) {
  const [parsedData, setParsedData] = useState<any>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sip, setSip] = useState(10);

  useEffect(() => {
    onFormChange(sip === 10 ? generateTemplate(parsedData) : generateTemplateSip13(parsedData));
  }, [parsedData, onFormChange]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;

      if (file.type === 'text/csv') {
        const lines: string[] = content.split('\n') || [];
        const addresses: Address[] = lines
          .map(line => {
            const [address, amount] = line.split(',').map(item => item.trim());
            return { address, amount: amount ? parseInt(amount) : DEFAULT_TOKEN_AMOUNT };
          })
          .filter(item => item.address);
        formatAddresses(addresses);
      } else {
        const addresses: Address[] = content
          .split('\n')
          .map((address: string) => address.trim())
          .filter(Boolean)
          .map((address: string) => ({ address, amount: DEFAULT_TOKEN_AMOUNT }));
        formatAddresses(addresses);
      }
    };

    reader.readAsText(file);
  };

  interface Address {
    address: string;
    amount: number;
  }

  const formatAddresses = (addresses: Address[]) => {
    console.log(addresses.length);
    console.log(uniq(addresses).length);
    const formattedData = uniqBy(addresses, 'address').map((item, index) => ({
      id: index + 1,
      address: item.address,
      amount: item.amount
    }));

    setParsedData(formattedData);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`w-full h-48 border rounded-lg flex items-center justify-center cursor-pointer ${isDragging ? 'bg-primary/10 animate-pulse' : ''
        }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        accept=".txt,.csv"
        onChange={handleFileInputChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div className="text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-1 text-sm text-secondary/80">
          {isDragging ? 'Drop the file here' : 'Click to upload or drag and drop'}
        </p>
        <p className="mt-1 text-xs text-secondary/50">.txt or .csv files only</p>
      </div>
    </div>
  );
}
