import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus, StyleSheet, Text, View, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

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
    </View >
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
  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  async function setupAndPlay(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('./assets/sounds/audio.mp3'),
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        }
      );

      soundRef.current = sound;
    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  }

  useEffect(() => {
    setupAndPlay();
    const subscription = AppState.addEventListener(
      'change',
      async (nextState: AppStateStatus) => {
        if (appState.current === 'active' && nextState === 'background') {
          await soundRef.current?.pauseAsync();
        } else if (appState.current === 'background' && nextState === 'active') {
          await soundRef.current?.playAsync();
        }
        appState.current = nextState;
      }
    );

    return () => {
      subscription.remove();
      soundRef.current?.unloadAsync();
    };
  }, []);


  useEffect(() => {
    const getImages = async () => {
      try {
        const data = await callApiToGetImages()
        setImages(data)
      } catch (error) {
        setLoading(true)
        console.error(error)
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
            <Image
              source={require('./assets/loading/bd3c6ca5-e1b0-4662-a33c-546c35df26e0.png')}
              style={{ width: 300, height: 300 }} />
            <ActivityIndicator color={"#fff"} size={"large"} />
            <Text>Loading...</Text>
          </View>
        ) : (
          <ImageList images={images} />
        )}
      </SafeAreaView>
    </SafeAreaProvider >
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
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


