
/**
 * Automatically linkifies URLs, Hashtags, and Phone numbers in a text string.
 * @param text The raw text content to format.
 * @returns An array of string and React elements.
 */
export const renderFormattedContent = (text: string) => {
  if (!text) return null;

  // Regex for URLs (with and without protocol)
  const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;
  // Regex for Hashtags
  const hashtagRegex = /(#[a-zA-Z0-9_\u0080-\uFFFF]+)/g;
  // Regex for potential phone numbers (simple 10 digit check for India)
  const phoneRegex = /(\b\d{10}\b)/g;

  // Splitting by spaces but keeping them as separate parts
  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    // URL matching
    if (urlRegex.test(part)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    // Hashtag matching
    if (hashtagRegex.test(part)) {
      return (
        <span
          key={index}
          className="text-blue-400 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {part}
        </span>
      );
    }
    // Phone matching
    if (phoneRegex.test(part)) {
      return (
        <a
          key={index}
          href={`tel:${part}`}
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};