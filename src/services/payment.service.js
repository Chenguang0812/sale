import { apiClient } from "./api.client";

export async function createPaymentSession(productId, email) {
    if (!productId) {
        return {
            ok: false,
            message: "productId is required",
        };
    }

    if (!email) {
        return {
            ok: false,
            message: "email is required",
        };
    }

    try {
        return await apiClient("/api/payments/newebpay/create", {
            method: "POST",
            body: JSON.stringify({
                productId,
                email,
            }),
        });
    } catch (error) {
        return {
            ok: false,
            message: error.message || "Create payment session failed",
        };
    }
}