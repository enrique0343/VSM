import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function useExport(mapName: string) {
  const captureCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) throw new Error('Canvas no encontrado');
    return html2canvas(el, {
      backgroundColor: '#f1f5f9',
      scale: 2,
      useCORS: true,
      logging: false,
    });
  }, []);

  const exportPNG = useCallback(async () => {
    const canvas = await captureCanvas();
    const link = document.createElement('a');
    link.download = `${mapName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [captureCanvas, mapName]);

  const exportPDF = useCallback(async () => {
    const canvas = await captureCanvas();
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${mapName}.pdf`);
  }, [captureCanvas, mapName]);

  const copyShareLink = useCallback(async (mapId: string) => {
    const url = `${location.origin}?map=${mapId}`;
    await navigator.clipboard.writeText(url);
    return url;
  }, []);

  return { exportPNG, exportPDF, copyShareLink };
}
