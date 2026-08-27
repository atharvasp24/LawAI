import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpeechToText from 'react-native-voice';
import QueryHeader from '../components/Query/QueryHeader';
import QueryInput from '../components/Query/QueryInput';
import QueryResponse from '../components/Query/QueryResponse';
import SubmitButton from '../components/Query/SubmitButton';
import CasePopup from '../components/Query/CasePopup';
import CaseModal from '../components/Query/CaseModal';

interface CaseDetails {
  caseHeading: string;
  userQuery: string;
  tags: string;
  description: string;
  caseStatus: string;
}

interface ResponseData {
  acts?: Record<string, string>;
  description?: string;
  [key: string]: any;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const Query: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<ResponseData | string>('Response will appear here...');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    caseHeading: '',
    userQuery: '',
    tags: '',
    description: '',
    caseStatus: 'closed',
  });

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const handleMicClick = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      const Ctor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!Ctor) {
        Alert.alert('Not Supported', 'Voice input needs Chrome or Edge.');
        return;
      }

      // Already listening -> stop and keep whatever we captured
      if (isListening) {
        try {
          recognitionRef.current?.stop();
        } catch {}
        setIsListening(false);
        return;
      }

      finalTranscriptRef.current = '';

      const recognition = new Ctor();
      recognition.lang = 'en-IN';
      recognition.continuous = true;        // keep listening through pauses
      recognition.interimResults = true;    // show words as they are recognised
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += chunk + ' ';
          } else {
            interim += chunk;
          }
        }

        const combined = (finalTranscriptRef.current + interim).trim();
        if (combined) {
          setQuery(combined);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);

        if (event.error === 'no-speech') {
          Alert.alert('No Speech Detected', 'Nothing was heard. Tap the mic and speak clearly.');
        } else if (event.error === 'audio-capture') {
          Alert.alert('No Microphone', 'No microphone was found. Check your input device.');
        } else if (event.error === 'not-allowed') {
          Alert.alert('Permission Denied', 'Allow microphone access for this site and try again.');
        } else if (event.error !== 'aborted') {
          Alert.alert('Voice Error', `Speech recognition failed: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalText = finalTranscriptRef.current.trim();
        if (finalText) {
          setQuery(finalText);
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        setIsListening(false);
        Alert.alert('Voice Error', 'Could not start listening. Try again.');
      }
      return;
    }

    // Native (iOS / Android) path
    try {
      if (isListening) {
        await SpeechToText.stopListening();
        setIsListening(false);
      } else {
        await SpeechToText.startListening();
        setIsListening(true);
      }
    } catch {
      setIsListening(false);
    }
  };

  const handleQuerySubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an Indian legal assistant. Answer this legal query in plain text without any Markdown formatting (no asterisks, no hash symbols, no dashes for headers). Use simple line breaks and numbered points. Cite relevant IPC/CrPC sections:\n\n${query}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.error?.message ||
        'No response received.';

      setResponse(answer);

      setCaseDetails({
        caseHeading: 'New Case Identified',
        userQuery: query,
        tags: 'theft, investigation, IPC',
        description: answer,
        caseStatus: 'under investigation',
      });

      setShowPopup(true);
    } catch (err) {
      setError('Something went wrong while fetching the response.');
      setResponse('');
    }

    setIsLoading(false);
  };

  const handleSaveCase = async (): Promise<void> => {
    try {
      const existing = await AsyncStorage.getItem('savedCases');
      const cases = existing ? JSON.parse(existing) : [];

      cases.push({
        ...caseDetails,
        savedAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem('savedCases', JSON.stringify(cases));

      Alert.alert('Saved', 'Case saved locally on this device.');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save case locally.');
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setCaseDetails({
      ...caseDetails,
      [key]: value,
    });
  };

  return (
    <View style={styles.container}>
      <QueryHeader />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <QueryResponse
          response={response}
          isLoading={isLoading}
          error={error}
        />

        <QueryInput
          value={query}
          onChangeText={setQuery}
          onMicPress={handleMicClick}
          isListening={isListening}
        />

        <SubmitButton
          onPress={handleQuerySubmit}
          disabled={!query.trim() || isLoading}
        />
      </ScrollView>

      <CasePopup
        visible={showPopup}
        onPress={() => {
          setShowPopup(false);
          setModalVisible(true);
        }}
      />

      <CaseModal
        visible={modalVisible}
        caseDetails={caseDetails}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCase}
        onInputChange={handleInputChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
});

export default Query;