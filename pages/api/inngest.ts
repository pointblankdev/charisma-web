import { inngest, swap } from "@lib/ingest";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export default serve({
    client: inngest,
    functions: [
        swap,
    ],
});