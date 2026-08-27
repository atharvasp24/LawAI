import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, FlatList, useWindowDimensions, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseHeader from '../components/Database/DatabaseHeader';
import CaseCard from '../components/Database/CaseCard';
import CaseModal from '../components/Database/CaseModal';
import ScrollToTopButton from '../components/Database/ScrollToTopButton';
import EmptyState from '../components/Database/EmptyState';

interface CaseItem {
  id: number;
  caseHeading: string;
  query: string;
  applicableArticle?: string;
  description: string;
  status: string;
  tags?: string;
}

const Database = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaseData, setEditedCaseData] = useState<Partial<CaseItem>>({});

  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  const fetchData = async () => {
    try {
      const stored = await AsyncStorage.getItem('savedCases');
      const savedCases = stored ? JSON.parse(stored) : [];

      const mapped: CaseItem[] = savedCases.map((c: any, index: number) => ({
        id: index,
        caseHeading: c.caseHeading || 'Untitled Case',
        query: c.userQuery || '',
        applicableArticle: c.applicableArticle || '',
        description: c.description || '',
        status: c.caseStatus || 'unknown',
        tags: c.tags || '',
      }));

      setCases(mapped);
    } catch (error) {
      console.error('Error loading saved cases:', error);
      setCases([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh whenever this screen comes into focus (e.g. after saving a case elsewhere)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const openCaseDetailsModal = (id: number) => {
    const caseItem = cases.find((caseItem) => caseItem.id === id);
    if (caseItem) {
      setActiveCase(caseItem);
      setEditedCaseData(caseItem);
      setIsEditing(false);
    }
  };

  const closeCaseDetailsModal = () => {
    setActiveCase(null);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSaveChanges = async () => {
    if (!activeCase) return;

    const updatedCases = cases.map((caseItem) =>
      caseItem.id === activeCase.id
        ? {
            ...caseItem,
            caseHeading: editedCaseData.caseHeading || caseItem.caseHeading,
            query: editedCaseData.query || caseItem.query,
            applicableArticle: editedCaseData.applicableArticle || caseItem.applicableArticle,
            description: editedCaseData.description || caseItem.description,
            status: editedCaseData.status || caseItem.status,
            tags: editedCaseData.tags || caseItem.tags,
          }
        : caseItem
    );

    setCases(updatedCases);

    // Persist edits back to AsyncStorage
    try {
      const stored = await AsyncStorage.getItem('savedCases');
      const savedCases = stored ? JSON.parse(stored) : [];
      const updatedRaw = updatedCases.map((c) => ({
        caseHeading: c.caseHeading,
        userQuery: c.query,
        description: c.description,
        caseStatus: c.status,
        tags: c.tags,
      }));
      await AsyncStorage.setItem('savedCases', JSON.stringify(updatedRaw));
    } catch (err) {
      console.error('Error saving edited case:', err);
    }

    setActiveCase(null);
    setIsEditing(false);
  };

  const handleInputChange = (name: string, value: string) => {
    setEditedCaseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRemoveTag = (tagIndex: number) => {
    if (activeCase && activeCase.tags) {
      const tagsArray = activeCase.tags
        .replace(/[\[\]']+/g, '')
        .split(',')
        .map(tag => tag.trim());

      tagsArray.splice(tagIndex, 1);

      const updatedTags = tagsArray.join(', ');
      setEditedCaseData((prevData) => ({
        ...prevData,
        tags: updatedTags,
      }));
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleShowDetails = (id: number) => {
    openCaseDetailsModal(id);
  };

  const handleEdit = (id: number) => {
    openCaseDetailsModal(id);
    setIsEditing(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={(event) => {
          if (event.nativeEvent.contentOffset.y > 200) {
            setShowScrollBtn(true);
          } else {
            setShowScrollBtn(false);
          }
        }}
        scrollEventThrottle={16}
      >
        <DatabaseHeader />

        {cases.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={cases}
            renderItem={({ item }) => (
              <CaseCard
                caseItem={item}
                onShowDetails={handleShowDetails}
                onEdit={handleEdit}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>

      <ScrollToTopButton visible={showScrollBtn} onPress={scrollToTop} />

      <CaseModal
        visible={!!activeCase}
        caseItem={activeCase}
        isEditing={isEditing}
        editedData={editedCaseData}
        onClose={closeCaseDetailsModal}
        onEditToggle={handleEditToggle}
        onSave={handleSaveChanges}
        onInputChange={handleInputChange}
        onRemoveTag={handleRemoveTag}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
});

export default Database;