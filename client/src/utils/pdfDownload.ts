import axiosInstance from './axiosInstance';

export const getPdfPreviewUrl = (pdfUrl: string) => {
  const withoutQuery = pdfUrl.split('?')[0];
  const extension = withoutQuery.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return pdfUrl.replace('/upload/', '/upload/pg_1/').replace(/\.pdf(\?.*)?$/i, '.jpg$1');
  }

  return pdfUrl;
};

export const buildPdfFileName = (title: string) => {
  const safeTitle = title
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${safeTitle || 'resource'}.pdf`;
};

export const downloadPdf = async (pdfUrl: string, fileName: string) => {
  try {
    const response = await axiosInstance.get('/posts/download-pdf', {
      params: { url: pdfUrl, name: fileName },
      responseType: 'blob',
    });

    const objectUrl = URL.createObjectURL(response.data);
    triggerDownload(objectUrl, fileName);
    URL.revokeObjectURL(objectUrl);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      window.alert('Please login first to download PDFs.');
      window.location.assign('/login');
      return;
    }

    const message = await getDownloadErrorMessage(error);
    window.alert(message);
  }
};

const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();
};

const getDownloadErrorMessage = async (error: any) => {
  const fallbackMessage =
    "This PDF could not be downloaded because Cloudinary is blocking PDF delivery. Enable 'Allow delivery of PDF and ZIP files' in Cloudinary Security settings.";

  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
};
