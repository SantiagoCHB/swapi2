// src/componentes/Perfil.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function Perfil() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    // Si no hay usuario autenticado, actualizamos el estado de carga y notificamos
    if (!uid) {
      Alert.alert('Error', 'No estás autenticado');
      setCargando(false);
      return;
    }
    // Función para obtener los datos del usuario de Firestore
    const traerDatos = async () => {
      try {
        const docRef = doc(db, 'usuarios', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre || '');
          setFecha(data.fecha || '');
          setTelefono(data.telefono || '');
        } else {
          Alert.alert('Usuario no encontrado');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error al obtener los datos', error.message);
      } finally {
        setCargando(false);
      }
    };

    traerDatos();
  }, [uid]);

  const actualizarDatos = async () => {
    if (!uid) {
      Alert.alert('Error', 'No estás autenticado');
      return;
    }
    try {
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, { nombre, fecha, telefono });
      Alert.alert('Éxito', 'Datos actualizados correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al actualizar los datos', error.message);
    }
  };

  if (cargando) {
    return (
      <View style={styles.cargandoContainer}>
        <Text style={styles.cargandoText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Perfil del Usuario</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="white"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de nacimiento (YYYY-MM-DD)"
        placeholderTextColor="white"
        value={fecha}
        onChangeText={setFecha}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="white"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <Button title="Guardar cambios" onPress={actualizarDatos} color="black"  />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: 40,
    flex: 1,
    backgroundColor: '#3c3c3c'
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    color: 'white' // El texto ingresado será blanco
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cargandoText: {
    fontSize: 16,
    textAlign: 'center'
  }
});