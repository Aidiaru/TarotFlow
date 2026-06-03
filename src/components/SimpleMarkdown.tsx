import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface SimpleMarkdownProps {
  text: string;
  style?: TextStyle;
}

/**
 * Lightweight markdown renderer for bot messages.
 * Supports: **bold**, *italic*, and paragraph breaks.
 * No heavy deps needed — just regex parsing into <Text> nesting.
 */
export default function SimpleMarkdown({ text, style }: SimpleMarkdownProps) {
  const elements = parseMarkdown(text);

  return (
    <Text style={[styles.base, style]} selectable>
      {elements}
    </Text>
  );
}

function parseMarkdown(text: string): React.ReactNode[] {
  // Split by bold first (**text**), then italic (*text*)
  const parts: React.ReactNode[] = [];
  
  // Process line by line for paragraph spacing
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // Add line break
      parts.push(<Text key={`br-${lineIndex}`}>{'\n'}</Text>);
    }
    
    if (line.trim() === '') {
      // Empty line = paragraph break (extra spacing via a thin newline)
      parts.push(<Text key={`pbr-${lineIndex}`}>{'\n'}</Text>);
      return;
    }

    // Parse inline formatting
    const inlineParts = parseInline(line, lineIndex);
    parts.push(...inlineParts);
  });

  return parts;
}

function parseInline(text: string, lineKey: number): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Match **bold** and *italic* patterns
  // Order matters: ** before *
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  
  let lastIndex = 0;
  let match;
  let partIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      result.push(
        <Text key={`${lineKey}-t-${partIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </Text>
      );
    }

    if (match[2]) {
      // **bold**
      result.push(
        <Text key={`${lineKey}-b-${partIndex++}`} style={styles.bold}>
          {match[2]}
        </Text>
      );
    } else if (match[3]) {
      // *italic*
      result.push(
        <Text key={`${lineKey}-i-${partIndex++}`} style={styles.italic}>
          {match[3]}
        </Text>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(
      <Text key={`${lineKey}-t-${partIndex++}`}>
        {text.slice(lastIndex)}
      </Text>
    );
  }

  return result;
}

const styles = StyleSheet.create({
  base: {
    fontSize: 15,
    lineHeight: 24,
    color: '#D8D0E8',
    letterSpacing: 0.1,
  },
  bold: {
    fontWeight: '700',
    color: '#EDE7F6',
  },
  italic: {
    fontStyle: 'italic',
    color: '#C8BFFF',
  },
});
