import { Inngest } from "inngest";
import { serve } from "inngest/next";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "dexterity" });

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

// Create an API that serves zero functions
export default serve({
    client: inngest,
    functions: [
        helloWorld, // <-- This is where you'll always add your new functions
    ],
});