import { apiClient } from "./api.client";

export async function requestDownload(productSlug) {
    return await apiClient("/api/download/request", {
        method: "POST",
        body: JSON.stringify({
            productSlug,
        }),
    });
}