import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event) => {
    // Robust detection of method and path across different API Gateway versions (v1.0 or v2.0)
    const method = (event.requestContext?.http?.method || event.httpMethod || "UNKNOWN").toUpperCase();
    const path = event.rawPath || event.path || "/";
    const routeKey = event.routeKey || event.requestContext?.routeKey || `${method} ${path}`;

    console.log(`Request: ${method} ${path} (RouteKey: ${routeKey})`);

    try {
        // Match list vaults
        if (routeKey === "GET /vaults" || (method === "GET" && path === "/vaults")) {
            const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
            const response = await s3Client.send(listCommand);
            const vaults = response.Contents?.map(obj => obj.Key) || [];
            return {
                statusCode: 200,
                body: JSON.stringify({ vaults }),
            };
        }

        // Match individual vault operations
        // Path will look like /vaults/filename.enc
        const pathParts = path.split('/').filter(p => p !== "");
        const vaultName = pathParts[1] ? decodeURIComponent(pathParts[1]) : null;

        if (pathParts[0] === "vaults" && vaultName) {
            if (method === "GET") {
                const getCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: vaultName });
                const response = await s3Client.send(getCommand);
                const streamToBuffer = (stream) =>
                    new Promise((resolve, reject) => {
                        const chunks = [];
                        stream.on("data", (chunk) => chunks.push(chunk));
                        stream.on("error", reject);
                        stream.on("end", () => resolve(Buffer.concat(chunks)));
                    });
                const buffer = await streamToBuffer(response.Body);
                return {
                    statusCode: 200,
                    body: buffer.toString("base64"),
                    isBase64Encoded: true,
                    headers: { "Content-Type": "application/octet-stream" }
                };
            }

            if (method === "PUT") {
                const putCommand = new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: vaultName,
                    Body: Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
                });
                await s3Client.send(putCommand);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: "Vault saved successfully" }),
                };
            }

            if (method === "DELETE") {
                const deleteCommand = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: vaultName });
                await s3Client.send(deleteCommand);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: "Vault deleted successfully" }),
                };
            }
        }

        // Catch-all 404 with full debug info
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Lambda: Route Not Found",
                method: method,
                path: path,
                routeKey: routeKey,
                rawEvent: JSON.stringify(event).substring(0, 500) // Truncated raw event for debugging
            }),
        };
    } catch (error) {
        console.error("Lambda Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message,
                method: method,
                path: path
            }),
        };
    }
};
