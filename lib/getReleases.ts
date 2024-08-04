import { getSignature } from "./github.js";

const extensions = [
    { target: 'windows', arch: 'x86_64', extension: `x64_${process.env.DEFAULT_LANG}.msi.zip` },
    { target: 'windows', arch: 'i686', extension: `x86_${process.env.DEFAULT_LANG}.msi.zip` },
    { target: 'darwin', arch: 'x86_64', extension: 'x64.app.tar.gz' },
    { target: 'darwin', arch: 'aarch64', extension: 'aarch64.app.tar.gz' },
    { target: 'linux', arch: 'x86_64', extension: 'amd64.AppImage.tar.gz' },
];

export const getReleases = async (assets: Array<any>, target: string, arch: string): Promise<any> => {
    let data: any = {};
    const targetExtension = extensions.find((element) => target === element.target && arch === element.arch);

    if (targetExtension) {
        const releaseAsset = assets.find((release) => release.name.endsWith(targetExtension.extension));
        const signatureAsset = assets.find((release) => release.name.endsWith(targetExtension.extension + '.sig'));

        if (releaseAsset) {
            data['url'] = releaseAsset.browser_download_url;
            data['assets_url'] = releaseAsset.url;
            data['date'] = releaseAsset.created_at;
        }

        if (process.env.SIGNATURE === 'true' && signatureAsset) {
            // Obtener el contenido de la firma desde el assets_url
            const signatureContent = await getSignature(signatureAsset.url);
            data['signature'] = signatureContent;
        }
    }

    return data;
};
