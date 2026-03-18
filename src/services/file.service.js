import { apiClient } from "./api.client";

export async function requestDownload(productSlug, email) {
    return await apiClient("/api/download/request", {
        method: "POST",
        body: JSON.stringify({
            productSlug,
            email,
        }),
    });
}

export async function requestCheckoutDownload(order, access) {
    return await apiClient("/api/download/request", {
        method: "POST",
        body: JSON.stringify({
            order,
            access,
        }),
    });
}