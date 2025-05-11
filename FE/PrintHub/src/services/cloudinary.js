export async function uploadFile(file) {
    const cloudName = 'dhmbivnr2'; // your cloud name
    const uploadPreset = 'ml_default'; // the name you created

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        console.log('Upload successful:', data);
        return data;
    } catch (err) {
        console.error('Upload failed:', err);
        return null;
    }
}
