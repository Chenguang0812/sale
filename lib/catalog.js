export const PRODUCT_CATALOG = {
    "demo-pack": {
        slug: "demo-pack",
        title: "20 Viral Subtitle Animations",
        price: 150,
        fileName: "subtitle-pack-v2.zip",
        storagePath: "demo-pack/subtitle-pack-v2.zip",
    },
    "creator-pack": {
        slug: "creator-pack",
        title: "Creator Pack",
        price: 300,
        fileName: "creator-pack-v1.zip",
        storagePath: "creator-pack/creator-pack-v1.zip",
    },
    "pro-pack": {
        slug: "pro-pack",
        title: "Pro Pack",
        price: 10000,
        fileName: "pro-pack-v1.zip",
        storagePath: "pro-pack/pro-pack-v1.zip",
    },
};

export function getProductConfig(slug) {
    return PRODUCT_CATALOG[String(slug || "").trim()] || null;
}