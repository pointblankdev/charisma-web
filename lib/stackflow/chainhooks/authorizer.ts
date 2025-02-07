// lib/api/createEventHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySecret } from '@lib/stackflow/auth';
import { EVENTS } from '@lib/stackflow/chainhooks/event-handlers';
import { processEvent } from './event-handlers';

export function createEventHandler(
    eventType: keyof typeof EVENTS,
    handler: (data: any) => Promise<void>
) {
    return async function (req: NextRequest) {
        if (!verifySecret(req.headers)) {
            return NextResponse.json(
                { error: 'Forbidden: Invalid authorization' },
                { status: 403 }
            );
        }

        if (req.method !== 'POST') {
            return NextResponse.json(
                { error: 'Method not allowed' },
                { status: 405 }
            );
        }

        try {
            const body = await req.json();
            await processEvent(eventType, handler, body.apply);
            return NextResponse.json({ message: 'Event processed successfully' });
        } catch (error) {
            console.error(`Error processing ${eventType} event:`, error);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }
}