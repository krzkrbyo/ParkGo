import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useRef } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type Props = {
  value: string;
  sizePx?: number;        // default 600
  paperSizeMm?: number;   // default 60
  quietZoneMm?: number;   // default 4
  autoSharePdf?: boolean; // default false
  onPrint?: () => void;
  onPdfGenerated?: (uri: string) => void;
};

export default function PrintableQRCode({
  value,
  sizePx = 600,
  paperSizeMm = 60,
  quietZoneMm = 4,
  autoSharePdf = false,
  onPrint,
  onPdfGenerated,
}: Props) {
  const svgRef = useRef<QRCode | null>(null);

  const getDataUrl = useCallback(() => new Promise<string>((resolve) => {
    svgRef.current?.toDataURL((data) => resolve(`data:image/png;base64,${data}`));
  }), []);

  const buildHtml = (dataUrl: string) => {
    const area = paperSizeMm - quietZoneMm * 2;
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>QR Code Ticket</title>
        <style>
          @page { 
            size: ${paperSizeMm}mm ${paperSizeMm}mm; 
            margin: ${quietZoneMm}mm; 
          }
          html, body { 
            margin: 0; 
            padding: 0; 
            width: 100%;
            height: 100%;
          }
          .wrap {
            width: ${area}mm; 
            height: ${area}mm;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: #fff;
            margin: 0 auto;
          }
          img { 
            width: ${area}mm; 
            height: ${area}mm; 
            display: block;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <img src="${dataUrl}" alt="QR Code" />
        </div>
      </body>
    </html>`;
  };

  const printNow = useCallback(async () => {
    try {
      const dataUrl = await getDataUrl();
      const html = buildHtml(dataUrl);
      await Print.printAsync({ html });
      onPrint?.();
    } catch (error) {
      console.error('Error printing QR:', error);
      throw error;
    }
  }, [getDataUrl, onPrint]);

  const generatePdf = useCallback(async () => {
    try {
      const dataUrl = await getDataUrl();
      const html = buildHtml(dataUrl);
      const file = await Print.printToFileAsync({ 
        html,
        base64: false,
      });
      
      if (autoSharePdf && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir QR Code PDF',
          UTI: 'public.pdf',
        });
      }
      
      onPdfGenerated?.(file.uri);
      return file.uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }, [getDataUrl, autoSharePdf, onPdfGenerated]);

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <QRCode
          value={value}
          size={sizePx}
          color="black"
          backgroundColor="white"
          getRef={(c) => (svgRef.current = c)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Imprimir ahora" onPress={printNow} />
        <Button title="Generar PDF" onPress={async () => {
          try {
            const uri = await generatePdf();
            console.log('PDF URI:', uri);
          } catch (error) {
            console.error('Error generating PDF:', error);
          }
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});
