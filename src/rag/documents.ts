import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import type { Document } from './types.js';

//Juntamos todos los nombres de todos los documentos de la carpera Knowledge
const KNOWLEDGE_DIR = join(process.cwd(), 'src', 'knowledge');

//Aqui crearemos el array de documentos
export async function loadDocuments(): Promise<Document[]> {
  //metemos cada documento de la carpeta en una string y todos ellos en un array
  const files = await readdir(KNOWLEDGE_DIR);

  // Nos quedamos solos con los archivos .md (por si metemos un jpg en knowledge (aunque no deberiamos))
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  // convertimos cada md en un "document" con un id con su nombre y un text con su contenido.
  const documents = await Promise.all(
    mdFiles.map(async (file): Promise<Document> => {
      const filePath = join(KNOWLEDGE_DIR, file);
      const text = await readFile(filePath, 'utf-8');
      const id = basename(file, '.md');

      return { id, text };
    }),
  );

  return documents;
}
