import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Import components
import {
  FIRHeader,
  DownloadSection,
  FIRDetailsCard,
  OffenceDetailsCard,
  ComplainantDetailsCard,
  FormButton
} from '../components/FIR';

interface FIRFormData {
  district: string;
  policeStation: string;
  year: string;
  firNo: string;
  date: string;
  act1: string;
  sections1: string;
  act2: string;
  sections2: string;
  act3: string;
  sections3: string;
  otherActs: string;
  offenceDay: string;
  offenceDate: string;
  offenceTime: string;
  infoReceivedDate: string;
  infoReceivedTime: string;
  generalDiaryRef: string;
  typeOfInfo: string;
  occurrenceDirection: string;
  beatNo: string;
  address: string;
  outsidePS: string;
  complainantName: string;
  fatherName: string;
  birthDate: string;
  nationality: string;
  passportNo: string;
  passportIssueDate: string;
  passportIssuePlace: string;
  occupation: string;
  complainantAddress: string;
  accusedDetails: string;
  delayReason: string;
  stolenProperties: string;
  stolenValue: string;
  inquestReportNo: string;
  actionTaken: string;
  officerName: string;
  officerRank: string;
  officerNo: string;
  signature: string;
  dispatchDate: string;
  dispatchTime: string;
}

const FormToPDF = () => {
  const navigation = useNavigation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState<FIRFormData>({
    district: '',
    policeStation: '',
    year: '',
    firNo: '',
    date: '',
    act1: '',
    sections1: '',
    act2: '',
    sections2: '',
    act3: '',
    sections3: '',
    otherActs: '',
    offenceDay: '',
    offenceDate: '',
    offenceTime: '',
    infoReceivedDate: '',
    infoReceivedTime: '',
    generalDiaryRef: '',
    typeOfInfo: '',
    occurrenceDirection: '',
    beatNo: '',
    address: '',
    outsidePS: '',
    complainantName: '',
    fatherName: '',
    birthDate: '',
    nationality: '',
    passportNo: '',
    passportIssueDate: '',
    passportIssuePlace: '',
    occupation: '',
    complainantAddress: '',
    accusedDetails: '',
    delayReason: '',
    stolenProperties: '',
    stolenValue: '',
    inquestReportNo: '',
    actionTaken: '',
    officerName: '',
    officerRank: '',
    officerNo: '',
    signature: '',
    dispatchDate: '',
    dispatchTime: ''
  });

  // Handle field changes
  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const requiredFields: (keyof FIRFormData)[] = ['district', 'policeStation', 'firNo', 'complainantName', 'address'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        Alert.alert('Validation Error', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }
    return true;
  };

  const downloadDocx = async () => {
    setIsDownloading(true);

    const docUrl = 'https://savelifefoundation.org/wp-content/uploads/2016/11/A1-Format-of-FIR-part-of-Step-I.docx';

    if (Platform.OS === 'web') {
      window.open(docUrl, '_blank');
      setIsDownloading(false);
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + 'FIR-Format.docx';

      await FileSystem.downloadAsync(docUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          'Download Complete',
          'The FIR format has been downloaded and saved to your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading the file:', error);
      Alert.alert(
        'Download Failed',
        'There was an issue downloading the FIR format. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!validateForm()) return;

    setIsGeneratingPDF(true);

    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          h1, h2 { text-align: center; color: #1e3a8a; }
          .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .field { margin: 8px 0; }
          .label { font-weight: bold; color: #333; }
          .value { margin-left: 10px; }
        </style>
      </head>
      <body>
        <h1>FORM – IF1 (Integrated Form)</h1>
        <h2>FIRST INFORMATION REPORT</h2>

        <div class="section">
          <h3>FIR Details</h3>
          <p class="field"><span class="label">District:</span><span class="value">${formData.district}</span></p>
          <p class="field"><span class="label">Police Station:</span><span class="value">${formData.policeStation}</span></p>
          <p class="field"><span class="label">Year:</span><span class="value">${formData.year}</span></p>
          <p class="field"><span class="label">F.I.R. No:</span><span class="value">${formData.firNo}</span></p>
          <p class="field"><span class="label">Date:</span><span class="value">${formData.date}</span></p>
        </div>

        <div class="section">
          <h3>Offence Details</h3>
          <p class="field"><span class="label">Offence Date:</span><span class="value">${formData.offenceDate}</span></p>
          <p class="field"><span class="label">Offence Time:</span><span class="value">${formData.offenceTime}</span></p>
          <p class="field"><span class="label">Address:</span><span class="value">${formData.address}</span></p>
        </div>

        <div class="section">
          <h3>Complainant Details</h3>
          <p class="field"><span class="label">Name:</span><span class="value">${formData.complainantName}</span></p>
          <p class="field"><span class="label">Father's/Husband's Name:</span><span class="value">${formData.fatherName}</span></p>
          <p class="field"><span class="label">Date of Birth:</span><span class="value">${formData.birthDate}</span></p>
          <p class="field"><span class="label">Nationality:</span><span class="value">${formData.nationality}</span></p>
          <p class="field"><span class="label">Occupation:</span><span class="value">${formData.occupation}</span></p>
          <p class="field"><span class="label">Address:</span><span class="value">${formData.complainantAddress}</span></p>
        </div>
      </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        Alert.alert('Popup Blocked', 'Please allow popups for this site to generate the PDF.');
      }
      setIsGeneratingPDF(false);
      return;
    }

    try {
      const options = {
        html: htmlContent,
        fileName: 'FIR_report',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert(
        'PDF Generated Successfully',
        'Your FIR report has been generated and saved.',
        [
          { text: 'View PDF', onPress: () => (navigation as any).navigate('ViewPDF', { filePath: file.filePath }) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <FIRHeader
        title="FIR Management"
        subtitle="Download official formats and generate custom reports"
      />

      {/* Download Section */}
      <DownloadSection
        isDownloading={isDownloading}
        onDownload={downloadDocx}
      />

      {/* Form Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Generate Custom FIR Report</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Fill in the details below to generate a customized FIR report in PDF format.
        </Text>

        {/* FIR Details Card */}
        <FIRDetailsCard
          formData={{
            district: formData.district,
            policeStation: formData.policeStation,
            year: formData.year,
            firNo: formData.firNo,
            date: formData.date,
          }}
          onChange={handleChange}
        />

        {/* Offence Details Card */}
        <OffenceDetailsCard
          formData={{
            offenceDate: formData.offenceDate,
            offenceTime: formData.offenceTime,
            address: formData.address,
          }}
          onChange={handleChange}
        />

        {/* Complainant Details Card */}
        <ComplainantDetailsCard
          formData={{
            complainantName: formData.complainantName,
            fatherName: formData.fatherName,
            birthDate: formData.birthDate,
            nationality: formData.nationality,
            occupation: formData.occupation,
            complainantAddress: formData.complainantAddress,
          }}
          onChange={handleChange}
        />

        {/* Generate PDF Button */}
        <FormButton
          title="Generate FIR PDF"
          loadingTitle="Generating PDF..."
          isLoading={isGeneratingPDF}
          onPress={generatePDF}
          iconName="document"
          backgroundColor="#059669"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    margin: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
});

export default FormToPDF;