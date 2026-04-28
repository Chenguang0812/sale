// api/debug/upload-test.js
/* eslint-env node */
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

const PRIVATE_BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || "digital-products";

export default async function handler(req, res) {
    try {
        const testPath = "creator-pack-v1.zip";

        const testFile = new Blob(["test file"], {
            type: "application/zip",
        });

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(PRIVATE_BUCKET)
            .upload(testPath, testFile, {
                upsert: true,
                contentType: "application/zip",
            });

        console.log("UPLOAD data:", uploadData);
        console.log("UPLOAD error:", uploadError);

        if (uploadError) {
            return res.status(500).json({
                ok: false,
                step: "upload",
                message: uploadError.message,
                details: uploadError,
            });
        }

        const { data: signedData, error: signedError } = await supabaseAdmin.storage
            .from(PRIVATE_BUCKET)
            .createSignedUrl(testPath, 300, {
                download: "creator-pack-v1.zip",
            });

        console.log("SIGNED data:", signedData);
        console.log("SIGNED error:", signedError);

        if (signedError || !signedData?.signedUrl) {
            return res.status(500).json({
                ok: false,
                step: "signed-url",
                message: signedError?.message || "Create signed url failed",
                details: signedError,
            });
        }

        return res.status(200).json({
            ok: true,
            bucket: PRIVATE_BUCKET,
            path: testPath,
            uploadData,
            signedUrl: signedData.signedUrl,
        });
    } catch (error) {
        console.error("debug upload test error:", error);

        return res.status(500).json({
            ok: false,
            message: error?.message || "Debug upload test failed",
        });
    }
}