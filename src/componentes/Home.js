import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { imagenesPersonajes } from './images'; // asegúrate de que la ruta sea correcta

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const res = await fetch("https://www.swapi.tech/api/people?page=2&limit=83");
      const json = await res.json();
      setData(json.results);
    };
    obtenerDatos();
  }, []);

  return (
    <ScrollView>
      <View style={styles.lista}>
        {data.map((person, index) => {
          const id = person.uid;
          // Usa la imagen del mapping, si no existe, usa una imagen default
          const imagen = imagenesPersonajes[id] || require('../../assets/personajes/default.jpeg');
          return (
            <View key={index} style={styles.item}>
              <Text>
                <Text style={styles.personId}>{id}</Text>
                <Text style={styles.personName}> - {person.name}</Text>
              </Text>
              <Image source={imagen} style={styles.imagen} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: {
    backgroundColor: 'black',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'space-between',
    padding: 30,
    
  },

  item: {
    backgroundColor: '#3c3c3c',
    width: '48%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagen: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  personId: {
    color: 'white', // Color para el ID
    fontWeight: 'bold',
  },
  personName: {
    color: 'white', // Color para el nombre
  },
});