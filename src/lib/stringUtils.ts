export function formatGovName(text: string, _type: 'department' | 'barangay') {
  if (!text) return '';

  // 1. Remove the "Noisy" prefixes
  const cleanText =
    _type === 'department'
      ? text.replace(/DEPARTMENT OF /gi, '').trim()
      : text.replace(/BARANGAY /gi, '').trim();

  // 2. Define words that should stay lowercase
  const minorWords = ['of', 'the', 'and', 'for', 'in', 'on'];

  // 3. Define acronyms that should stay uppercase
  const acronyms = ['ICT', 'HR', 'BFP', 'PNP', 'MDRRMO', 'MSWDO', 'MPDC'];

  return cleanText
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize the first word
      if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);

      // Keep acronyms uppercase
      if (acronyms.includes(word.toUpperCase())) return word.toUpperCase();

      // Keep minor words lowercase
      if (minorWords.includes(word)) return word;

      // Default: Title Case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function toTitleCase(text: string) {
  if (!text) return '';

  // Words that should stay lowercase
  const minorWords = ['of', 'and', 'the', 'in', 'for', 'on', 'with'];
  // Acronyms that should stay uppercase
  const acronyms = [
    'GAD',
    'BPLO',
    'MDRRMO',
    'ICT',
    'MSWDO',
    'MPDC',
    'HR',
    'BFP',
    'PNP',
    'RHU',
  ];

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      const upperWord = word.toUpperCase();

      // If it's an acronym, keep it all caps
      if (acronyms.includes(upperWord)) return upperWord;

      // If it's a minor word and not the first word, keep it lowercase
      if (minorWords.includes(word) && index !== 0) return word;

      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
