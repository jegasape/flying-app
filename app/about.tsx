import { ScrollView, View, Text } from "react-native"
import { Link } from 'expo-router'


export default function About() {
  return (
    <ScrollView>
      <View style={{ flex: 1, marginTop: 200 }}>
        <Text style={{ color: "#fff", fontStyle: "normal", fontWeight: "bold" }}>
          About
        </Text>
        <Text style={{ color: "#fff" }}>
          Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incidid
          unt ut labore et dolore magna aliqua. Ut enim a
          d minim veniam, quis nostrud exercitation ullam
          co laboris nisi ut aliquip ex ea commodo conseq
          uat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nu
          lla pariatur. Excepteur sint occaecat cupidatat
          non proident, sunt in culpa qui officia deseru
          nt mollit anim id est laborum.
        </Text>
        <Link href="/" style={{ color: "#fff", fontWeight: "bold", fontSize: 50 }}>
          Ir Atras
        </Link>
      </View>
    </ScrollView>
  )
}
