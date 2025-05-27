import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { NavigationContainer, DefaultTheme} from '@react-navigation/native';
import { createNativeStackNavigator } from
'@react-navigation/native-stack';

import { createBottomTabNavigator } from
'@react-navigation/bottom-tabs';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';

import Login from './src/componentes/Login';
import Registro from './src/componentes/Registro';
import Home from './src/componentes/Home';
import Original from './src/componentes/Original';
import Perfil from './src/componentes/Perfil';
import Logout from './src/componentes/Logout';

const Tab = createBottomTabNavigator();

// Crea un tema personalizado basado en el DefaultTheme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#dark', // Cambia al color deseado
    // Puedes personalizar primary, card, text, etc.
  },
};


const Stack = createNativeStackNavigator();

export default function App() {
const [usuario, setUsuario] = useState(null);
const [cargando, setCargando] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
  setUsuario(user);
  setCargando(false);
  });
  return unsubscribe;

}, []);

if (cargando) {
  return (
  <View style={{ flex: 1, justifyContent: 'center',
  alignItems: 'center' }}>
  <ActivityIndicator size="large" />
  </View>
  );
}

  return (
  <NavigationContainer theme={MyTheme}>
<Tab.Navigator
  screenOptions={{
    headerShown: false, 

    tabBarStyle: {
      backgroundColor: '#2b2b2b',
    },
    tabBarActiveTintColor: 'white',    
    tabBarInactiveTintColor: '#adaaaa', 
  }}
>
  {usuario ? (
    <>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarIcon: () => null }} 
      />
      <Tab.Screen
        name="Original"
        component={Original}
        options={{ tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{ tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Logout"
        component={Logout}
        options={{ tabBarIcon: () => null }}
      />
    </>
  ) : (
    <>
      <Tab.Screen
        name="Login"
        component={Login}
        options={{ tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Registro"
        component={Registro}
        options={{ tabBarIcon: () => null }}
      />
    </>
  )}
</Tab.Navigator>
  </NavigationContainer>

  );
}
