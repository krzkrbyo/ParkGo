import React, { useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrintableQRCode from '../components/PrintableQRCode';
import { Colors } from '../constants/theme';

export default function TestPrintScreen() {
  const [value, setValue] = useState('https://example.com/ticket/12345');
  const [sizePx, setSizePx] = useState(600);
  const [paperSizeMm, setPaperSizeMm] = useState(60);
  const [quietZoneMm, setQuietZoneMm] = useState(4);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  
  const qrRef = useRef<PrintableQRCode>(null);

  const handlePrint = () => {
    Alert.alert('Impresión', 'Enviando a impresora...');
  };

  const handlePdfGenerated = (uri: string) => {
    setPdfUri(uri);
    Alert.alert('PDF Generado', `PDF creado en: ${uri}`);
  };

  const handleTestPrint = async () => {
    try {
      if (qrRef.current) {
        await (qrRef.current as any).printNow();
      }
    } catch (error) {
      Alert.alert('Error', 'Error al imprimir: ' + (error as Error).message);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      if (qrRef.current) {
        const uri = await (qrRef.current as any).generatePdf();
        setPdfUri(uri);
        Alert.alert('PDF Generado', `PDF creado exitosamente`);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al generar PDF: ' + (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Prueba de Impresión QR</Text>
          <Text style={styles.subtitle}>
            Configura los parámetros y prueba la impresión
          </Text>
        </View>

        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor del QR:</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Ingresa el valor del QR"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tamaño en píxeles: {sizePx}px</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setSizePx(Math.max(200, sizePx - 50))}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{sizePx}</Text>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setSizePx(Math.min(1000, sizePx + 50))}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tamaño de papel: {paperSizeMm}mm</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setPaperSizeMm(Math.max(40, paperSizeMm - 5))}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{paperSizeMm}</Text>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setPaperSizeMm(Math.min(80, paperSizeMm + 5))}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zona silenciosa: {quietZoneMm}mm</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setQuietZoneMm(Math.max(2, quietZoneMm - 1))}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{quietZoneMm}</Text>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setQuietZoneMm(Math.min(10, quietZoneMm + 1))}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Vista Previa</Text>
          <PrintableQRCode
            ref={qrRef}
            value={value}
            sizePx={sizePx}
            paperSizeMm={paperSizeMm}
            quietZoneMm={quietZoneMm}
            onPrint={handlePrint}
            onPdfGenerated={handlePdfGenerated}
          />
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleTestPrint}>
            <Text style={styles.actionButtonText}>Imprimir Ahora</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleGeneratePdf}>
            <Text style={styles.actionButtonText}>Generar PDF</Text>
          </TouchableOpacity>

          {pdfUri && (
            <View style={styles.pdfInfo}>
              <Text style={styles.pdfLabel}>PDF generado:</Text>
              <Text style={styles.pdfUri}>{pdfUri}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
  configSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  previewSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdfInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  pdfLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  pdfUri: {
    fontSize: 12,
    color: Colors.light.text,
    fontFamily: 'monospace',
  },
});
