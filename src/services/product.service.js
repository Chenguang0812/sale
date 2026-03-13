const products = [
    {
        id: 'p1',
        slug: 'demo-pack',
        title: '20 Viral Subtitle Animations',
        price: 299,
        description: '為 Premiere Pro 剪輯流程打造的文字動畫包，適合短影音、自媒體、教學片與商業剪輯使用。',
    },
    {
        id: 'p2',
        slug: 'creator-pack',
        title: 'Creator Pack',
        price: 499,
        description: '提供更多常用動畫與更完整的商業使用情境，適合穩定接案與高頻剪輯工作流。',
    },
    {
        id: 'p3',
        slug: 'pro-pack',
        title: 'Pro Pack',
        price: 899,
        description: '加入更多進階字卡模板、擴充內容與後續更新權益，適合想建立完整素材庫的使用者。',
    },
]

export function getAllProducts() {
    return products
}

export function getProductBySlug(slug) {
    return (
        products.find((product) => product.slug === slug) || {
            id: '',
            slug: '',
            title: 'Product Not Found',
            price: 0,
            description: '找不到這個商品。',
        }
    )
}