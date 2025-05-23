import { View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { H1, Muted } from "@/components/ui/typography";

export default function Modal() {
	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<View className="flex flex-1 items-center justify-center p-4 gap-y-4">
				<H1 className="text-center">Modal</H1>
				<Muted className="text-center">This is a modal screen.</Muted>
			</View>
		</SafeAreaView>
	);
}
