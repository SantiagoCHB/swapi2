import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { imagenesPersonajes } from './images'; // Asegúrate de que la ruta sea la correcta

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:.'.split('');
const MAX_ATTEMPTS = 5;
const MAX_PEOPLE = 82; // Ajusta según la cantidad de personajes de SWAPI

export default function JuegoStarWars() {
  // Estados para el personaje
  const [characterName, setCharacterName] = useState("");
  const [characterImage, setCharacterImage] = useState(null);
  const [characterId, setCharacterId] = useState("");

  // Estados para la mecánica del juego
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de estadísticas del usuario
  const [userWin, setUserWin] = useState(0);
  const [userLose, setUserLose] = useState(0);
  const [uid, setUid] = useState(null);

  // Escuchar el login del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  // Obtener datos del usuario (estadísticas) desde Firestore
  useEffect(() => {
    if (!uid) return;
    const traerDatos = async () => {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserWin(data.ganados || 0);
        setUserLose(data.perdidos || 0);
      } else {
        await setDoc(docRef, { ganados: 0, perdidos: 0 });
        setUserWin(0);
        setUserLose(0);
      }
      setLoading(false);
    };
    traerDatos();
  }, [uid]);

  // Función para guardar el resultado en Firestore
  const guardarResultado = async (acierto) => {
    if (!uid) return;
    const fecha = new Date().toISOString();
    const resultado = {
      uid,
      character: characterName,
      aciertos: acierto ? 1 : 0,
      errores: acierto ? 0 : 1,
      fecha,
    };
    try {
      await setDoc(doc(db, 'resultados', `${uid}_${fecha}`), resultado);
      await updateDoc(doc(db, 'usuarios', uid), {
        ganados: acierto ? userWin + 1 : userWin,
        perdidos: !acierto ? userLose + 1 : userLose,
      });
    } catch (e) {
      console.error('Error al guardar resultado:', e);
    }
  };

  // Obtener un personaje aleatorio usando SWAPI
  useEffect(() => {
    const getRandomCharacter = async () => {
      const randomId = Math.floor(Math.random() * MAX_PEOPLE) + 1;
      try {
        const response = await fetch(`https://www.swapi.tech/api/people/${randomId}`);
        const data = await response.json();
        // Asumimos que la estructura es data.result.properties.name
        setCharacterName(data.result.properties.name.toUpperCase());
        setCharacterId(randomId);
        // Usamos la imagen local definida en el objeto mapping
        const imagen =  require('../../assets/personajes/default.jpeg');
        setCharacterImage(imagen);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener el personaje:', err);
      }
    };
    getRandomCharacter();
  }, []);

  
  const handleLetterClick = async (letter) => {
    if (guessedLetters.includes(letter) || gameOver || gameWon) return;
    const updatedGuessed = [...guessedLetters, letter];
    setGuessedLetters(updatedGuessed);
    if (!characterName.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (newWrongGuesses >= MAX_ATTEMPTS) {
        setGameOver(true);
        setUserLose(userLose + 1);
        await guardarResultado(false);
      }
    } else {
      const allCorrect = characterName.split('').every((l) => updatedGuessed.includes(l));
      if (allCorrect) {
        setGameWon(true);
        setUserWin(userWin + 1);
        await guardarResultado(true);
      }
    }
  };

 
  const renderWord = () =>
    characterName.split('').map((letter, index) => (
      <Text key={index} style={styles.letter}>
        {guessedLetters.includes(letter) || gameOver || gameWon ? letter : '_'}
      </Text>
    ));

  // Reiniciar el juego
  const restartGame = () => {
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setGameWon(false);
    setLoading(true);
    setCharacterName('');
    setCharacterImage(null);
    setCharacterId('');
    const randomId = Math.floor(Math.random() * MAX_PEOPLE) + 1;
    fetch(`https://www.swapi.tech/api/people/${randomId}`)
      .then((res) => res.json())
      .then((data) => {
        setCharacterName(data.result.properties.name.toUpperCase());
        setCharacterId(randomId);
        const imagen = require('../../assets/personajes/default.jpeg');
        setCharacterImage(imagen);
        setLoading(false);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adivina el personaje</Text>
      <Text style={styles.stats}>Ganados: {userWin} | Perdidos: {userLose}</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text>{characterId}</Text> {/* Puedes quitar este Text si no deseas mostrar el ID */}
          <Image source={characterImage} style={styles.image} />
          <View style={styles.wordContainer}>{renderWord()}</View>
          <View style={styles.keyboard}>
            {ALPHABET.map((letter) => (
              <TouchableOpacity
                key={letter}
                onPress={() => handleLetterClick(letter)}
                disabled={guessedLetters.includes(letter) || gameOver || gameWon}
                style={[
                  styles.key,
                  guessedLetters.includes(letter) && styles.keyDisabled,
                ]}
              >
                <Text>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.attempts}>
            Fallos: {wrongGuesses} / {MAX_ATTEMPTS}
          </Text>
          {gameOver && (
            <Text style={styles.lost}>¡Perdiste! Era: {characterName}</Text>
          )}
          {gameWon && <Text style={styles.won}>¡Ganaste!</Text>}
          {(gameOver || gameWon) && (
            <TouchableOpacity style={styles.button} onPress={restartGame}>
              <Text style={styles.buttonText}>Jugar otra vez</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 50, 
    alignItems: 'center', 
    backgroundColor: 'white'
  },
  title: { 
    fontSize: 24, 
    marginBottom: 10 
  },
  image: { 
    width: 150, 
    height: 150, 
    marginVertical: 10 },
  stats: { 
    marginBottom: 10, 
    fontSize: 16 
  },
  wordContainer: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    flexWrap: 'wrap' },
  letter: { 
    fontSize: 28, 
    marginHorizontal: 4 
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  key: {
    backgroundColor: '#eee',
    padding: 10,
    margin: 4,
    borderRadius: 4,
    width: 40,
    alignItems: 'center',
  },
  keyDisabled: { 
    backgroundColor: '#ccc' 
  },
  attempts: { 
    fontSize: 16, 
    marginBottom: 10 
  },
  lost: { 
    color: 'red', 
    fontSize: 18 
  },
  won: { 
    color: 'green', 
    fontSize: 18 
  },
  button: { 
    marginTop: 10, 
    padding: 10, 
    backgroundColor: '#0066cc', 
    borderRadius: 5 
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
});