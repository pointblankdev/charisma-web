import { Inngest } from "inngest";
import { serve } from "inngest/next";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "dexterity" });

// Create an API that serves zero functions
export default serve({
    client: inngest,
    functions: [
        /* your functions will be passed here later! */
    ],
});