import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { C, F } from '../theme/buscaliTheme';

function nombreCompleto(nombre: string, apellido: string) {
  return `${nombre} ${apellido}`.trim();
}

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Cuenta activa</Text>
        <Text style={styles.title}>
          Hola, {nombreCompleto(user.nombre, user.apellido ?? '')}
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>ID</Text>
          <Text style={styles.value}>{user.id}</Text>
        </View>
        {user.email ? (
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        ) : null}
        {user.telefono ? (
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{user.telefono}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{user.rol}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: `${C.outlineVariant}33`,
    shadowColor: '#003439',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  kicker: {
    fontFamily: F.bodyBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: F.headline,
    fontSize: 24,
    color: C.onSurface,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${C.outlineVariant}55`,
  },
  label: {
    fontFamily: F.bodyMed,
    fontSize: 15,
    color: C.onSurfaceVariant,
  },
  value: {
    fontFamily: F.bodySemi,
    fontSize: 15,
    color: C.onSurface,
  },
  button: {
    marginTop: 28,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: F.headlineMed,
    fontSize: 16,
    color: C.onPrimary,
  },
});
