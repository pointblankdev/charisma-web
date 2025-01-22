import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Twitter, Plus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { toast } from '@components/ui/use-toast';

interface Legend {
    handle: string;
    profileImage?: string;
}

interface TweetBuilderProps {
    initialLegends: Legend[];
}

export function TweetBuilder({ initialLegends }: TweetBuilderProps) {
    const [tweetText, setTweetText] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newHandle, setNewHandle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [legends, setLegends] = useState<Legend[]>(initialLegends);
    const maxTweetLength = 1000;

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleAddHandle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHandle) return;

        const handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/legends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle })
            });

            if (!res.ok) throw new Error('Failed to add handle');

            setLegends(prev => [...prev, { handle }]);
            setNewHandle('');
            toast({
                title: 'Success',
                description: 'Twitter handle added successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add Twitter handle',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const constructTweet = () => {
        const tags = selectedTags.join(' ');
        return `${tweetText}\n\n${tags}`;
    };

    const handleTweetSubmit = () => {
        const tweet = constructTweet();
        const encodedTweet = encodeURIComponent(tweet);
        window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank');
    };

    const remainingChars = maxTweetLength - constructTweet().length;

    return (
        <Card className="p-6 bg-[var(--sidebar)] border-[var(--accents-7)]">
            <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                    <label className="text-sm text-muted-foreground">Tweet Content</label>
                    <Textarea
                        value={tweetText}
                        onChange={(e) => setTweetText(e.target.value)}
                        placeholder="What's happening?"
                        className="min-h-[100px]"
                    />
                    <div className="text-sm text-muted-foreground">
                        {remainingChars} characters remaining
                    </div>
                </div>

                <form onSubmit={handleAddHandle} className="flex gap-2">
                    <Input
                        value={newHandle}
                        onChange={(e) => setNewHandle(e.target.value)}
                        placeholder="Add Twitter handle..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                    </Button>
                </form>

                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Select Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {legends.map(({ handle, profileImage }) => (
                            <Button
                                key={handle}
                                variant={selectedTags.includes(handle) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTagToggle(handle)}
                                className="text-xs flex items-center gap-2"
                            >
                                {/* <Avatar className="w-4 h-4">
                                    <AvatarImage src={profileImage} alt={handle} />
                                    <AvatarFallback>{handle[1].toUpperCase()}</AvatarFallback>
                                </Avatar> */}
                                {handle}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleTweetSubmit}
                    disabled={remainingChars < 0 || !tweetText.trim()}
                    className="w-full"
                >
                    <Twitter className="w-4 h-4 mr-2" />
                    Post to Twitter
                </Button>
            </div>
        </Card>
    );
} 