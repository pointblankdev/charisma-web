import { ChangeEvent } from 'react';
import { Button } from './button';
import { X } from 'lucide-react';

interface ImageUploadProps {
    value?: File | string;
    onChange: (file: File | string) => void;
    onRemove: () => void;
    onUpload?: (file: File) => Promise<string>;
}

export function ImageUpload({ value, onChange, onRemove, onUpload }: ImageUploadProps) {
    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (onUpload) {
                const url = await onUpload(file);
                onChange(url);
            } else {
                onChange(file);
            }
        }
    };

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="image-upload"
            />
            <label htmlFor="image-upload">
                <Button type="button" variant="outline" asChild>
                    <span className='whitespace-nowrap'>Upload Image</span>
                </Button>
            </label>
            {value && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {typeof value === 'string' ? value.split('/').pop() : value.name}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
} 