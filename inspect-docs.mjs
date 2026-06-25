import mammoth from 'mammoth';

const files = [
  'data/LMUI_Career_Guidance_Framework-888f64.docx',
  'data/LMUI_Academic_Programs_Catalog-3ac92e.docx',
  'data/Intelligente_Master_Document_v2-6557dc.docx'
];

for (const file of files) {
  console.log(`\n${'='.repeat(80)}\n${file}\n${'='.repeat(80)}\n`);
  try {
    const result = await mammoth.extractRawText({ path: file });
    console.log(result.value.slice(0, 3000));
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}
