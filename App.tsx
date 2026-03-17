import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus, StyleSheet, Text, View, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Logo } from './components/logo';

const API = `https://api.slingacademy.com/v1/sample-data/photos?limit=200`

interface IPhotos {
  id: number,
  user: number,
  title: string,
  description: string,
  url: string
}

async function callApiToGetImages() {
  const req = await fetch(API)
  if (!req.ok) {
    throw new Error("Error: fecthing data from api...")
  }
  const res = await req.json()
  const photos = res["photos"]
  return photos as IPhotos[]
}

function ImageCard({ image }: { image: IPhotos }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image.url }} style={styles.image} />
      <Text>{image.user}</Text>
      <Text>{image.title}</Text>
      <Text>{image.description}</Text>
    </View>
  )
}

function ImageList({ images }: { images: IPhotos[] }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <FlatList
        data={images}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => <ImageCard image={item} />}
      />
    </View>
  )
}

export default function App() {
  const [images, setImages] = useState<IPhotos[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const player = useAudioPlayer(require('./assets/sounds/audio.mp3'));

  useEffect(() => {
    const setup = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
        player.play();
      } catch (error) {
      }
    }

    setup();

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (appState.current === 'active' && nextState === 'background') {
          player.pause();
        } else if (appState.current === 'background' && nextState === 'active') {
          player.play();
        }
        appState.current = nextState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const getImages = async () => {
      try {
        const data = await callApiToGetImages()
        setImages(data)
      } catch (error) {
        setLoading(true)
      } finally {
        await new Promise(re => setTimeout(re, 5000))
        setLoading(false)
      }
    }
    getImages()
  }, [])

  return (
    <SafeAreaProvider style={{ backgroundColor: '#000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {loading ? (
          <View style={styles.loadingContainer}>
            <Logo />
            <ActivityIndicator color={"#fff"} size={"large"} />
            <Text>Loading...</Text>
          </View>
        ) : (
          <ImageList images={images} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    alignItems: 'center',
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 5,
    marginBottom: 5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});
