import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english', flag: '🇺🇸' },
  { code: 'hi', labelKey: 'language.hindi', flag: '🇮🇳' },
];

const LanguageSelector = ({ onSelect }: { onSelect: () => void }) => {
  const { i18n, t } = useTranslation();

  return (
    <View style={styles.container}>
      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.langRow}
            onPress={() => {
              i18n.changeLanguage(item.code);
              onSelect();
            }}>
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={styles.label}>{t(item.labelKey)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default LanguageSelector;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  flag: {
    fontSize: 22,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#222',
  },
});
