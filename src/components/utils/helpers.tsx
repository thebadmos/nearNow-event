export const formatTime = (dateString: string) => {
	const options: any = {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	};
	const date = new Date(dateString);
	return date.toLocaleString("en-US", options);
};

export const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		dateStyle: "medium",
	};

	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", options);
};
