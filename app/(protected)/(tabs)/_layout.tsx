import { Tabs } from "expo-router";
import { Home, Settings } from "lucide-react-native";
import React from "react";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color, size }) => (
						<Settings size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
