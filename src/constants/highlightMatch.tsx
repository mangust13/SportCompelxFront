export const highlightMatch = (text: string | number, query: string) => {
    if (!query) return text;
  
    const textStr = String(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // екранує спецсимволи regex
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = textStr.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{ backgroundColor: '#facc15', padding: '0 2px' }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};
  