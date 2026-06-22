// Curated cover image pool (from the Figma design). A random index (0–3) is
// assigned to each document on creation and stored on the document model.
export const COVER_IMAGES = [
  "https://www.figma.com/api/mcp/asset/380532d0-57c1-49bf-a884-9b401c26bad3", // Rectangle 16
  "https://www.figma.com/api/mcp/asset/615bc289-a9ad-45e2-8a2c-353e88e8e06b", // Rectangle 17
  "https://www.figma.com/api/mcp/asset/aa97cafd-3b5b-4594-9879-52e6902a87dc", // Rectangle 18
  "https://www.figma.com/api/mcp/asset/149d3e21-d768-4ad3-ac14-af8a7cc720d5", // Rectangle 22
];

export function getRandomCoverIndex() {
  return Math.floor(Math.random() * COVER_IMAGES.length);
}

export function getCoverImage(index) {
  return COVER_IMAGES[index ?? Math.floor(Math.random() * COVER_IMAGES.length)];
}
