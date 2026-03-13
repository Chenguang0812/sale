import { apiClient } from "./api.client";

export async function fetchMyDownloads(email) {
    return await apiClient("/api/orders/list", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}