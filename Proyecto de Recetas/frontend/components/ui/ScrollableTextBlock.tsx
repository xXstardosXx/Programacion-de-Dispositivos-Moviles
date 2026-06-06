import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface ScrollableTextBlockProps {
  text: string;
  maxHeight?: number;
}

export const ScrollableTextBlock: React.FC<ScrollableTextBlockProps> = ({
  text,
  maxHeight = 200,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 300;

  return (
    <View>
      <ScrollView
        style={[styles.scrollBox, { maxHeight }]}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <Text style={styles.text}>{text}</Text>
      </ScrollView>

      {isLong && (
        <TouchableOpacity style={styles.expandBtn} onPress={() => setExpanded(true)}>
          <Text style={styles.expandText}>Ver preparación completa</Text>
        </TouchableOpacity>
      )}

      <Modal visible={expanded} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setExpanded(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Preparación completa</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator>
              <Text style={styles.modalText}>{text}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setExpanded(false)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  expandBtn: { marginTop: spacing.sm, alignItems: 'center' },
  expandText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalScroll: { maxHeight: 400 },
  modalText: { fontSize: 15, color: colors.text, lineHeight: 24 },
  closeBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeText: { color: '#FFF', fontWeight: '700' },
});
