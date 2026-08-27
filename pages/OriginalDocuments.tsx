import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Linking } from 'react-native';
import OriginalDocumentsHeader from '../components/OriginalDocuments/OriginalDocumentsHeader';
import SearchBar from '../components/OriginalDocuments/SearchBar';
import PdfCard from '../components/OriginalDocuments/PdfCard';

interface PdfItem {
  id: number;
  act_name: string;
  description: string;
  url: string;
}

const documentData: PdfItem[] = [
  {
    id: 1,
    act_name: "Indian Penal Code (IPC) 1860",
    description: "Complete text of the Indian Penal Code containing criminal law provisions and punishments.",
    url: "https://www.indiacode.nic.in/bitstream/123456789/4219/1/THE-INDIAN-PENAL-CODE-1860.pdf",
  },
  {
    id: 2,
    act_name: "Code of Criminal Procedure (CrPC) 1973",
    description: "Comprehensive guide to criminal procedure and court processes in India.",
    url: "https://www.indiacode.nic.in/bitstream/123456789/15272/1/the_code_of_criminal_procedure,_1973.pdf",
  },
  {
    id: 3,
    act_name: "Indian Evidence Act 1872",
    description: "Laws governing the admissibility and relevance of evidence in Indian courts.",
    url: "https://en.wikipedia.org/wiki/Indian_Evidence_Act,_1872",
  },
  {
    id: 4,
    act_name: "Motor Vehicles Act 1988",
    description: "Regulations for road transport, vehicle registration, and traffic rules.",
    url: "https://en.wikipedia.org/wiki/Motor_Vehicles_Act",
  },
  {
    id: 5,
    act_name: "Constitution of India 1950",
    description: "The supreme law of India containing fundamental rights, directive principles, and governance structure.",
    url: "https://www.indiacode.nic.in/handle/123456789/2263",
  },
  {
    id: 6,
    act_name: "Civil Procedure Code (CPC) 1908",
    description: "Rules and procedures for civil litigation and court proceedings in India.",
    url: "https://en.wikipedia.org/wiki/Code_of_Civil_Procedure_(India)",
  },
];

const OriginalDocuments = () => {
  const [pdfs] = useState<PdfItem[]>(documentData);
  const [filteredPdfs, setFilteredPdfs] = useState<PdfItem[]>(documentData);
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');

  const handlePdfSearchChange = (query: string) => {
    setPdfSearchQuery(query);
    if (query === '') {
      setFilteredPdfs(pdfs);
    } else {
      const q = query.toLowerCase();
      setFilteredPdfs(
        pdfs.filter(
          (pdf) =>
            pdf.act_name.toLowerCase().includes(q) ||
            pdf.description.toLowerCase().includes(q)
        )
      );
    }
  };

  const handleDownloadPdf = async (pdfId: number) => {
    const doc = pdfs.find((p) => p.id === pdfId);
    if (!doc) return;
    await Linking.openURL(doc.url);
  };

  return (
    <View style={styles.container}>
      <OriginalDocumentsHeader
        title="Original Documents"
        subtitle="Official legal documents and PDFs"
      />

      <SearchBar
        value={pdfSearchQuery}
        onChangeText={handlePdfSearchChange}
        placeholder="Search documents by name or description..."
      />

      <FlatList
        data={filteredPdfs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PdfCard
            pdf={item}
            onDownload={handleDownloadPdf}
            isDownloading={false}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 20,
  },
});

export default OriginalDocuments;