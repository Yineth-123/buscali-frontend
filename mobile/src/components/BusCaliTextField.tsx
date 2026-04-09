import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { C, F } from '../theme/buscaliTheme';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  containerStyle?: object;
};

export default function BusCaliTextField({
  label,
  icon,
  containerStyle,
  style,
  ...inputProps
}: Props) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.fieldRow}>
        <MaterialIcons name={icon} size={22} color={C.primary} style={styles.icon} />
        <TextInput
          placeholderTextColor={`${C.outline}99`}
          style={[styles.input, style]}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontFamily: F.bodyBold,
    fontSize: 13,
    color: C.onSurface,
    marginLeft: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 14,
    paddingLeft: 4,
    minHeight: 52,
    shadowColor: '#003439',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { marginLeft: 10 },
  input: {
    flex: 1,
    fontFamily: F.bodyMed,
    fontSize: 16,
    color: C.onSurface,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
});
