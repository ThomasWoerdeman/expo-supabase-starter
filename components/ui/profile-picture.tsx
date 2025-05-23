import { Image } from "@/components/image";
import { Text } from "@/components/ui/text";
import { supabase } from "@/config/supabase";
import { cn } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import { Pencil } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";

interface ProfilePictureProps {
	userId: string;
	avatarUrl?: string;
	fullName?: string;
	size?: "small" | "medium" | "large";
	onUploadComplete?: (url: string) => void;
	editable?: boolean;
	className?: string;
}

const sizeClasses = {
	small: "w-16 h-16",
	medium: "w-24 h-24",
	large: "w-32 h-32",
};

export function ProfilePicture({
	userId,
	avatarUrl,
	fullName,
	size = "medium",
	onUploadComplete,
	editable = true,
	className,
}: ProfilePictureProps) {
	const [uploading, setUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState(avatarUrl);

	// Update imageUrl when avatarUrl prop changes
	useEffect(() => {
		setImageUrl(avatarUrl);
	}, [avatarUrl]);

	const getInitials = (name?: string) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const pickImage = async () => {
		if (!editable) return;

		// Request permissions
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission denied",
				"We need camera roll permissions to change your profile picture.",
			);
			return;
		}

		// Show options for camera or library
		Alert.alert(
			"Select Image",
			"Choose how you want to select your profile picture",
			[
				{ text: "Camera", onPress: openCamera },
				{ text: "Photo Library", onPress: openImageLibrary },
				{ text: "Cancel", style: "cancel" },
			],
		);
	};

	const openCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission denied",
				"We need camera permissions to take a photo.",
			);
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			uploadImage(result.assets[0].uri);
		}
	};

	const openImageLibrary = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			uploadImage(result.assets[0].uri);
		}
	};

	const uploadImage = async (uri: string) => {
		try {
			setUploading(true);

			const response = await fetch(uri);
			const blob = await response.blob();
			const arrayBuffer = await new Response(blob).arrayBuffer();

			const fileExt = uri.split(".").pop();
			const fileName = `avatar.${fileExt}`;
			const filePath = `${userId}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, arrayBuffer, {
					contentType: `image/${fileExt}`,
					upsert: true,
				});

			if (uploadError) {
				throw uploadError;
			}

			const {
				data: { publicUrl },
			} = supabase.storage.from("avatars").getPublicUrl(filePath);

			setImageUrl(publicUrl);
			onUploadComplete?.(publicUrl);

			Alert.alert("Success", "Profile picture updated successfully!");
		} catch (error) {
			console.error("Error uploading image:", error);
			Alert.alert("Error", "Failed to upload image. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	const fullImageUrl = imageUrl ? `${imageUrl}?t=${Date.now()}` : null;

	return (
		<TouchableOpacity
			onPress={pickImage}
			disabled={!editable || uploading}
			className={cn("relative", className)}
		>
			<View
				className={cn(
					"rounded-full overflow-hidden border-2 border-border items-center justify-center",
					sizeClasses[size],
					uploading && "opacity-50",
				)}
			>
				{fullImageUrl ? (
					<Image
						source={{ uri: fullImageUrl }}
						className="w-full h-full"
						contentFit="cover"
					/>
				) : (
					<View className="w-full h-full bg-muted items-center justify-center">
						<Text
							className={cn(
								"font-semibold text-muted-foreground",
								size === "small" && "text-sm",
								size === "medium" && "text-lg",
								size === "large" && "text-2xl",
							)}
						>
							{getInitials(fullName)}
						</Text>
					</View>
				)}
			</View>

			{editable && (
				<View className="absolute -bottom-1 -right-1 rounded-full p-1 bg-secondary dark:bg-primary">
					<Pencil
						size={12}
						className="text-secondary-foreground dark:text-primary-foreground"
					/>
				</View>
			)}

			{uploading && (
				<View className="absolute inset-0 bg-black/20 rounded-full items-center justify-center">
					<Text className="text-white text-xs">...</Text>
				</View>
			)}
		</TouchableOpacity>
	);
}
