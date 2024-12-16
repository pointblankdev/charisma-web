import { ImagePlus } from 'lucide-react';

interface MetadataPreviewProps {
  metadata: any | null;
}

export function MetadataPreview({ metadata }: MetadataPreviewProps) {
  return (
    <div>
      <h3 className="mb-4 text-2xl font-bold text-white/95">Token Preview</h3>
      {metadata ? (
        <div className="relative p-6 rounded-lg">
          {/* Token Image Section */}
          <div className="flex justify-center mb-6">
            <div className="relative p-1 shadow-2xl rounded-2xl">
              {metadata.image ? (
                <img src={metadata.image} alt={metadata.name} className="w-72 h-72 rounded-xl" />
              ) : (
                <div className="w-72 h-72 rounded-xl bg-black/20 animate-pulse" />
              )}
            </div>
          </div>

          {/* Token Info Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white/95">{metadata.name}</h3>
                <span className="px-3 py-1 font-mono text-sm border rounded-full shadow-lg bg-primary/10 border-primary/30 text-white/90">
                  {metadata.symbol}
                </span>
              </div>
              <p className="text-sm text-gray-400">{metadata.description}</p>
            </div>

            <div className="p-4 rounded-lg bg-black/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Token A</span>
                  <span className="font-mono text-white/90 truncate max-w-[200px]">
                    {metadata.properties?.tokenAContract.split('.')[1]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Token B</span>
                  <span className="font-mono text-white/90 truncate max-w-[200px]">
                    {metadata.properties?.tokenBContract.split('.')[1]}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm border-t border-white/10">
                  <span className="text-gray-400">LP Rebate</span>
                  <span className="text-white/90">{metadata.properties?.lpRebatePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-12 rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)]">
          <div className="space-y-3 text-center">
            <ImagePlus className="w-10 h-10 mx-auto text-gray-400" />
            <div className="text-gray-400">Generate metadata to preview your token</div>
          </div>
        </div>
      )}
    </div>
  );
}
