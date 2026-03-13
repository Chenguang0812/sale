export async function requestDownload(productSlug) {
    return {
        ok: true,
        mode: 'mock',
        downloadUrl: '/mock-download/file.zip'
    }
}