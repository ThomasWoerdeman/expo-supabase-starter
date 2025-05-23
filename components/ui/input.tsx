import { cn } from "@/lib/utils";
import * as React from "react";
import { TextInput, type TextInputProps, View } from "react-native";
import { Text } from "./text";

const Input = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	TextInputProps
>(({ className, placeholderClassName, ...props }, ref) => {
	return (
		<TextInput
			ref={ref}
			className={cn(
				"web:flex h-10 native:h-12 web:w-full  border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
				props.editable === false && "opacity-50 web:cursor-not-allowed",
				className,
			)}
			placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
			{...props}
		/>
	);
});

Input.displayName = "Input";

const PrefixInput = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	TextInputProps & { prefix?: string }
>(({ className, placeholderClassName, prefix = "@", ...props }, ref) => {
	return (
		<View
			className={cn(
				"web:flex h-10 native:h-12 web:w-full  border border-input bg-background web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
				"flex-row items-center",
				props.editable === false && "opacity-50 web:cursor-not-allowed",
			)}
		>
			<Text className="px-3 text-base lg:text-sm native:text-lg text-muted-foreground">
				{prefix}
			</Text>
			<TextInput
				ref={ref}
				className={cn(
					"flex-1 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:py-2 pr-3 bg-transparent file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none",
					className,
				)}
				placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
				{...props}
			/>
		</View>
	);
});

PrefixInput.displayName = "PrefixInput";

export { Input, PrefixInput };
