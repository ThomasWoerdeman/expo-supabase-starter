import {
	BarChart3,
	Bell,
	ChevronRight,
	FileText,
	HelpCircle,
	LogOut,
	Moon,
	Save,
	Trash2,
	X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input, PrefixInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfilePicture } from "@/components/ui/profile-picture";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { H1, H3, Muted } from "@/components/ui/typography";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";

interface Profile {
	id: string;
	email: string;
	full_name?: string;
	username?: string;
	instagram_handle?: string;
	avatar_url?: string;
	updated_at?: string;
}

interface SettingItemProps {
	icon: React.ComponentType<{ size?: number; color?: string }>;
	title: string;
	description?: string;
	rightElement?: React.ReactNode;
	onPress?: () => void;
	showChevron?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
	icon: Icon,
	title,
	description,
	rightElement,
	onPress,
	showChevron = false,
}) => {
	const { colorScheme } = useColorScheme();

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={!onPress}
			className="flex-row items-center p-4 bg-card rounded-xl"
			style={{ opacity: onPress ? 1 : 1 }}
		>
			<View className="w-10 h-10 items-center justify-center bg-muted rounded-full mr-3">
				<Icon
					size={20}
					color={colorScheme === "dark" ? "#ffffff" : "#000000"}
				/>
			</View>
			<View className="flex-1">
				<Text className="font-medium text-base">{title}</Text>
				{description && <Muted className="text-sm mt-1">{description}</Muted>}
			</View>
			{rightElement && <View className="ml-3">{rightElement}</View>}
			{showChevron && (
				<ChevronRight
					size={20}
					color={colorScheme === "dark" ? "#666" : "#999"}
					style={{ marginLeft: 12 }}
				/>
			)}
		</TouchableOpacity>
	);
};

interface SectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => (
	<View className="gap-y-3">
		<View className="px-1">
			<H3 className="text-lg font-semibold">{title}</H3>
			{description && <Muted className="text-sm mt-1">{description}</Muted>}
		</View>
		<View className="gap-y-2">{children}</View>
	</View>
);

export default function Settings() {
	const { session, signOut } = useAuth();
	const { colorScheme, setColorScheme } = useColorScheme();
	const [notifications, setNotifications] = useState(true);
	const [analytics, setAnalytics] = useState(false);
	const [autoSave, setAutoSave] = useState(true);

	// Profile state
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [fullName, setFullName] = useState("");
	const [username, setUsername] = useState("");
	const [instagramHandle, setInstagramHandle] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [showProfileEditor, setShowProfileEditor] = useState(false);

	useEffect(() => {
		if (session) {
			getProfile();
		}
	}, [session]);

	async function getProfile() {
		try {
			setLoading(true);
			if (!session?.user) throw new Error("No user");

			const { data, error, status } = await supabase
				.from("profiles")
				.select(`full_name, username, instagram_handle, avatar_url`)
				.eq("id", session.user.id)
				.single();

			if (error && status !== 406) {
				throw error;
			}

			if (data) {
				setProfile({
					id: session.user.id,
					email: session.user.email || "",
					...data,
				});
				setFullName(data.full_name || "");
				setUsername(data.username || "");
				setInstagramHandle(data.instagram_handle || "");
				setAvatarUrl(data.avatar_url || "");
			} else {
				// Profile doesn't exist, create initial state
				setProfile({
					id: session.user.id,
					email: session.user.email || "",
				});
			}
		} catch (error) {
			console.error("Error loading user data:", error);
			// Even if profile table doesn't exist, show basic user info
			if (session?.user) {
				setProfile({
					id: session.user.id,
					email: session.user.email || "",
				});
			}
		} finally {
			setLoading(false);
		}
	}

	async function updateProfile() {
		try {
			setUpdating(true);
			if (!session?.user) throw new Error("No user");

			const updates = {
				id: session.user.id,
				full_name: fullName,
				username,
				instagram_handle: instagramHandle,
				avatar_url: avatarUrl,
				updated_at: new Date().toISOString(),
			};

			const { error } = await supabase.from("profiles").upsert(updates);

			if (error) {
				throw error;
			}

			Alert.alert("Success", "Profile updated successfully!");
			await getProfile(); // Refresh the profile data
			setShowProfileEditor(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			Alert.alert("Error", "Failed to update profile. Please try again.");
		} finally {
			setUpdating(false);
		}
	}

	const handleAvatarUpload = (url: string) => {
		setAvatarUrl(url);
		// Auto-save the avatar URL when uploaded
		if (session?.user) {
			supabase.from("profiles").upsert({
				id: session.user.id,
				avatar_url: url,
				updated_at: new Date().toISOString(),
			});
		}
	};

	const handleSignOut = async () => {
		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign Out",
				style: "destructive",
				onPress: () => signOut(),
			},
		]);
	};

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-4">
				<Text>Loading settings...</Text>
			</View>
		);
	}

	if (showProfileEditor) {
		return (
			<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
				<View className="flex-1">
					{/* Header */}
					<View className="flex-row items-center justify-between p-4 border-b border-border">
						<TouchableOpacity onPress={() => setShowProfileEditor(false)}>
							<X
								size={24}
								color={colorScheme === "dark" ? "#ffffff" : "#000000"}
							/>
						</TouchableOpacity>
						<View className="items-center">
							<H1 className="text-xl font-bold">Edit Profile</H1>
							<Muted>Manage your profile information</Muted>
						</View>
						<View className="w-6" />
					</View>

					<ScrollView className="flex-1 p-4">
						<View className="gap-y-6">
							{/* Profile Picture Section */}
							<View className="items-center gap-y-4">
								{session?.user && (
									<ProfilePicture
										userId={session.user.id}
										avatarUrl={avatarUrl}
										fullName={fullName}
										size="large"
										onUploadComplete={handleAvatarUpload}
									/>
								)}
								<Muted className="text-center">
									Tap to change your profile picture
								</Muted>
							</View>

							{/* Form Fields */}
							<View className="gap-y-4">
								<View className="gap-y-2">
									<Label>Email</Label>
									<View className="bg-muted p-4">
										<Text className="text-muted-foreground">
											{profile?.email}
										</Text>
									</View>
									<Muted>Your email address cannot be changed here.</Muted>
								</View>

								<View className="gap-y-2">
									<Label>Full Name</Label>
									<Input
										value={fullName}
										onChangeText={setFullName}
										placeholder="Enter your full name"
										className="h-12"
									/>
								</View>

								<View className="gap-y-2">
									<Label>Username</Label>
									<Input
										value={username}
										onChangeText={setUsername}
										placeholder="Enter your username"
										autoCapitalize="none"
										className="h-12"
									/>
								</View>

								<View className="gap-y-2">
									<Label>Instagram Handle</Label>
									<PrefixInput
										value={instagramHandle}
										onChangeText={setInstagramHandle}
										placeholder="your-instagram-handle"
										keyboardType="url"
										prefix="@"
										autoCapitalize="none"
									/>
								</View>
							</View>
						</View>
					</ScrollView>

					{/* Footer */}
					<View className="p-4 border-t border-border">
						<Button
							className="w-full h-12"
							size="default"
							variant="default"
							onPress={updateProfile}
							disabled={updating}
						>
							<Text className="font-medium">
								{updating ? "Updating..." : "Save Changes"}
							</Text>
						</Button>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-y-6">
					{/* Header */}
					<View className="items-center mb-2">
						<H1 className="text-2xl font-bold">Settings</H1>
						<Muted>Manage your account and app preferences</Muted>
					</View>

					{/* Profile Section */}
					<Section title="Profile" description="Your personal information">
						<TouchableOpacity
							onPress={() => setShowProfileEditor(true)}
							className="p-4 bg-card rounded-xl"
						>
							<View className="flex-row items-center">
								{session?.user && (
									<ProfilePicture
										userId={session.user.id}
										avatarUrl={avatarUrl}
										fullName={fullName}
										size="medium"
									/>
								)}
								<View className="flex-1 ml-3">
									<Text className="font-medium text-base">
										{fullName || "Add your name"}
									</Text>
									<Muted className="text-sm">{profile?.email}</Muted>
									{username && <Muted className="text-sm">@{username}</Muted>}
								</View>
								<ChevronRight
									size={20}
									color={colorScheme === "dark" ? "#666" : "#999"}
								/>
							</View>
						</TouchableOpacity>
					</Section>

					{/* App Preferences */}
					<Section
						title="Preferences"
						description="Customize your app experience"
					>
						<SettingItem
							icon={Moon}
							title="Dark Mode"
							description="Use dark theme for the app"
							rightElement={
								<Switch
									checked={colorScheme === "dark"}
									onCheckedChange={(checked) => {
										setColorScheme(checked ? "dark" : "light");
									}}
								/>
							}
						/>

						<SettingItem
							icon={Bell}
							title="Push Notifications"
							description="Receive notifications for updates"
							rightElement={
								<Switch
									checked={notifications}
									onCheckedChange={setNotifications}
								/>
							}
						/>

						<SettingItem
							icon={Save}
							title="Auto Save"
							description="Automatically save your changes"
							rightElement={
								<Switch checked={autoSave} onCheckedChange={setAutoSave} />
							}
						/>
					</Section>

					{/* Privacy & Security */}
					<Section
						title="Privacy & Security"
						description="Control your data and privacy"
					>
						<SettingItem
							icon={BarChart3}
							title="Analytics"
							description="Help improve the app by sharing usage data"
							rightElement={
								<Switch checked={analytics} onCheckedChange={setAnalytics} />
							}
						/>

						<SettingItem
							icon={Trash2}
							title="Clear Cache"
							description="Free up storage space"
							onPress={() => {
								Alert.alert(
									"Clear Cache",
									"This will clear temporary files and may improve performance.",
									[
										{ text: "Cancel", style: "cancel" },
										{
											text: "Clear",
											onPress: () => console.log("Clearing app cache..."),
										},
									],
								);
							}}
							showChevron
						/>
					</Section>

					{/* Support & Legal */}
					<Section
						title="Support & Legal"
						description="Help and legal information"
					>
						<SettingItem
							icon={HelpCircle}
							title="Help & Support"
							description="Get help with using the app"
							onPress={() => console.log("Opening help...")}
							showChevron
						/>

						<SettingItem
							icon={FileText}
							title="Privacy Policy"
							description="Read our privacy policy"
							onPress={() => console.log("Opening privacy policy...")}
							showChevron
						/>

						<SettingItem
							icon={FileText}
							title="Terms of Service"
							description="Read our terms of service"
							onPress={() => console.log("Opening terms of service...")}
							showChevron
						/>
					</Section>

					{/* About */}
					<Section title="About" description="App information">
						<View className="bg-card rounded-xl p-4">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="font-medium">App Version</Text>
								<Text className="text-muted-foreground">1.0.0</Text>
							</View>
							<View className="flex-row justify-between items-center">
								<Text className="font-medium">Build Number</Text>
								<Text className="text-muted-foreground">100</Text>
							</View>
						</View>
					</Section>

					{/* Account Actions */}
					<Section title="Account">
						<SettingItem
							icon={LogOut}
							title="Sign Out"
							description="Sign out of your account"
							onPress={handleSignOut}
							showChevron
						/>
					</Section>

					{/* Bottom spacing */}
					<View style={{ height: 20 }} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
