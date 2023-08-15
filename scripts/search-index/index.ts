import path from 'path';
import fs from 'fs';
import MarkdownIt from 'markdown-it';

type SearchIndexEntry = {
  objectID: string;
  content: string;
  categories: string[];
  uri: string;
  title: string;
  description: string;
  summary: string;
  date: string;
  filepath: string;
};

const _generateIndexEntryParagraph = (
  paragraph: string,
  entry: SearchIndexEntry
): SearchIndexEntry[] => {
  const rangesToRemove: number[][] = [];
  const md = MarkdownIt().parse(paragraph, {});

  // Codeblocks
  const codeblocks = md.filter((token) => token.type === 'fence');
  codeblocks.forEach((codeblock) => {
    const [startLine, endLine] = codeblock.map!;
    rangesToRemove.push([startLine, endLine]);
  });
  const codeblockEntries = codeblocks.map((codeblock) => {
    const [startLine, endLine] = codeblock.map!;
    const codeblockLines = paragraph.split('\n').slice(startLine, endLine);
    const codeblockContent = codeblockLines.join('\n');
    const codeblockEntry: SearchIndexEntry = {
      ...entry,
      objectID: `${entry.objectID}-codeblock-${startLine}-${endLine}`,
      content: codeblockContent,
    };
    return codeblockEntry;
  });

  // Remove lines that are already converted to codeblocks
  const sortedRangesToRemove = rangesToRemove
    .sort((a, b) => a[0] - b[0])
    .reverse();
  let lines = paragraph.split('\n');
  sortedRangesToRemove.forEach(([startLine, endLine]) => {
    lines = lines.slice(0, startLine).concat(lines.slice(endLine));
  });

  // Generate paragraph entry
  const paragraphEntry: SearchIndexEntry = {
    ...entry,
    objectID: `${entry.objectID}-paragraph`,
    content: lines.join('\n'),
  };

  return [paragraphEntry, ...codeblockEntries];
};

const generateIndexEntry = (
  filepath: string,
  entry: SearchIndexEntry
): SearchIndexEntry[] => {
  const rawWithFrontmatter = fs.readFileSync(filepath, 'utf-8');
  const raw = rawWithFrontmatter.split('---').slice(2).join('---').trim();
  const lines = raw.split('\n');
  const lastLineNum = raw.split('\n').length;

  // Extract all headings
  const md = MarkdownIt().parse(raw, {});
  const headings = md.filter((token) => token.type === 'heading_open');
  const paragraphRanges = headings.map((heading, index) => {
    const nextHeading = headings[index + 1];
    const endLine = nextHeading ? nextHeading.map![0] - 1 : lastLineNum;
    return [heading.map![0], endLine];
  });

  return paragraphRanges
    .map((range) => {
      const [startLine, endLine] = range;
      const paragraph = lines.slice(startLine, endLine).join('\n');
      return _generateIndexEntryParagraph(paragraph, entry);
    })
    .flat();
};

/**
 * Read full index JSON file.
 */
const basePath = path.join(__dirname, '../../../../');
const fullSearchIndexFile = path.join(basePath, 'public/search.json');
if (!fs.existsSync(fullSearchIndexFile)) {
  throw new Error('No search index file found');
}
const fullSearchIndex: SearchIndexEntry[] = require(fullSearchIndexFile);

/**
 * Enumerate all files in the search index.
 */
const files = fullSearchIndex.map((entry) =>
  path.join(basePath, 'content', entry.filepath)
);

/**
 * For each file, generate an index entries.
 */
const indexEntries = files
  .map((filepath, index) => {
    const entry = fullSearchIndex[index];
    return generateIndexEntry(filepath, entry);
  })
  .flat();

/**
 * Output to the index file
 */
const indexFile = path.join(basePath, 'public/searc-split.json');
fs.writeFileSync(indexFile, JSON.stringify(indexEntries, null, 0));
