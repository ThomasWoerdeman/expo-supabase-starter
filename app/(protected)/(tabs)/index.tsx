import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { ProfilePicture } from "@/components/ui/profile-picture";
import { H1, Muted } from "@/components/ui/typography";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";

interface Profile {
	full_name?: string;
	avatar_url?: string;
}

export default function Home() {
	const { session } = useAuth();
	const [profile, setProfile] = useState<Profile | null>(null);

	useEffect(() => {
		if (session) {
			getProfile();
		}
	}, [session]);

	async function getProfile() {
		try {
			if (!session?.user) return;

			const { data, error } = await supabase
				.from("profiles")
				.select(`full_name, avatar_url`)
				.eq("id", session.user.id)
				.single();

			if (error && error.code !== "PGRST116") {
				console.error("Error loading profile:", error);
				return;
			}

			if (data) {
				setProfile(data);
			}
		} catch (error) {
			console.error("Error loading profile:", error);
		}
	}

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	const displayName =
		profile?.full_name || session?.user?.email?.split("@")[0] || "there";

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<View className="flex-1 items-center justify-center p-4 gap-y-6">
				{/* User Profile Section */}
				{session?.user && (
					<View className="items-center gap-y-4">
						<ProfilePicture
							userId={session.user.id}
							avatarUrl={profile?.avatar_url}
							fullName={profile?.full_name}
							size="large"
							editable={false}
						/>
						<View className="items-center gap-y-1">
							<H1 className="text-center">
								{getGreeting()}, {displayName}!
							</H1>
							<Muted className="text-center">
								Welcome back to your dashboard
							</Muted>
						</View>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
