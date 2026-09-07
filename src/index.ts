import readline from 'readline';
import { loadDocuments } from './rag/documents.js';
import { embedDocuments } from './services/embeddingService.js';
import { loadEmbeddedDocuments } from './services/storage.js';
import { search } from './services/retrievalService.js';
import { askQuestion } from './services/ragService.js';

const reset = '\x1b[0m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';

//Un minuto para apreciar como se ha currado el menu el agente.

function showBanner(): void {
  console.log(`
${bold}${green}██████╗  █████╗  ██████╗ ${reset}${cyan}    ██╗      █████╗ ██████╗  ${cyan}
${bold}${green}██╔══██╗██╔══██╗██╔════╝ ${reset}${cyan}    ██║     ██╔══██╗██╔══██╗ ${cyan}
${bold}${green}██████╔╝███████║██║  ███╗${reset}${cyan}    ██║     ███████║██████╔╝ ${cyan}
${bold}${green}██╔══██╗██╔══██║██║   ██║${reset}${cyan}    ██║     ██╔══██║██╔══██╗ ${cyan}
${bold}${green}██║  ██║██║  ██║╚██████╔╝${reset}${cyan}    ███████╗██║  ██║██████╔╝ ${cyan}
${bold}${green}╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ${reset}${cyan}    ╚══════╝╚═╝  ╚═╝╚═════╝ ${cyan}
${yellow}----------------------------------------------------- ${reset}
${yellow}========== ⚡ LangGraph + RAG Mini Lab ⚡ =========== ${reset}
${yellow}======= Este es un pequeño proyecto personal ======== ${reset}
${yellow}==== Para entender/practicar con RAG y LangGraph ==== ${reset}
${yellow}----------------------------------------------------- ${reset}`);
}

function showMenu(): void {
  console.log(`\n${bold}Selecciona una opción:${reset}`);
  console.log(`${cyan}1.${reset} Embeber documentos de knowledge/`);
  console.log(`${cyan}2.${reset} Auditar documentos embebidos`);
  console.log(`${cyan}3.${reset} Probar RAG (buscar similitud)`);
  console.log(`${cyan}4.${reset} Usar RAG (preguntar al LLM)`);
  console.log(`${cyan}5.${reset} Salir\n`);
}

async function handleEmbedDocuments(): Promise<void> {
  console.log(`\n${bold}${yellow}📦 Embebiendo documentos...${reset}\n`);

  try {
    const documents = await loadDocuments();
    console.log(`Encontrados ${documents.length} documentos en knowledge/`);

    const { newCount, skippedCount } = await embedDocuments(documents);

    if (newCount === 0) {
      console.log(
        `\n${cyan}ℹ️  Todos los documentos ya estaban embebidos.${reset}`,
      );
      console.log(`   Documentos skipped: ${skippedCount}`);
    } else {
      console.log(`\n${bold}${green}✅ Proceso completado.${reset}`);
      console.log(`   Nuevos: ${newCount} | Skipped: ${skippedCount}`);
    }
  } catch (error) {
    console.log(`\n${red}❌ Error al embeber documentos:${reset}`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
  }
}

async function handleAuditDocuments(): Promise<void> {
  console.log(
    `\n${bold}${yellow}📋 Auditoría de documentos embebidos${reset}\n`,
  );

  try {
    const embeddedDocs = await loadEmbeddedDocuments();

    if (embeddedDocs.length === 0) {
      console.log(`${red}No hay documentos embebidos.${reset}`);
      console.log(`Ejecuta la opción 1 para embeber documentos.\n`);
      return;
    }

    console.log(
      `${bold}Total de documentos embebidos:${reset} ${embeddedDocs.length}\n`,
    );
    console.log(`${'─'.repeat(60)}`);
    console.log(`${bold}ID${' '.repeat(20)} │ Texto │ Embedding${reset}`);
    console.log(`${'─'.repeat(60)}`);

    for (const doc of embeddedDocs) {
      const textPreview = doc.text.substring(0, 30).replace(/\n/g, ' ');
      const textSuffix = doc.text.length > 30 ? '...' : '';
      const embeddingInfo = `${doc.embedding.length} dims`;
      console.log(
        `${doc.id.padEnd(20)} │ ${textPreview}${textSuffix} │ ${embeddingInfo}`,
      );
    }

    console.log(`${'─'.repeat(60)}\n`);
  } catch (error) {
    console.log(`\n${red}❌ Error al auditar documentos:${reset}`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
  }
}

async function handleSearchQuery(): Promise<void> {
  console.log(`\n${bold}${yellow}🔍 Probar RAG${reset}\n`);

  try {
    const query = await promptUser('Escribe tu consulta: ');

    if (query.length > 500) {
      console.log(
        `\n${red}❌ Error: La consulta no puede exceder 500 caracteres.${reset}`,
      );
      console.log(`   Caracteres actuales: ${query.length}\n`);
      return;
    }

    const results = await search(query);

    if (results.length === 0) {
      console.log(
        `\n${cyan}No hay documentos embebidos para comparar.${reset}`,
      );
      console.log(`Ejecuta la opción 1 primero.\n`);
      return;
    }

    console.log(`\n${bold}Resultados de similitud:${reset}\n`);
    for (const result of results) {
      const percentage = (result.score * 100).toFixed(1);
      console.log(`  ${cyan}${percentage}%${reset} - ${result.document.id}`);
    }
    console.log();
  } catch (error) {
    console.log(`\n${red}❌ Error en la búsqueda:${reset}`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
  }
}

async function handleAskQuestion(): Promise<void> {
  console.log(`\n${bold}${yellow}🤖 Usar RAG (preguntar al LLM)${reset}\n`);

  try {
    const query = await promptUser('Escribe tu pregunta: ');

    if (query.length > 500) {
      console.log(
        `\n${red}❌ Error: La pregunta no puede exceder 500 caracteres.${reset}`,
      );
      console.log(`   Caracteres actuales: ${query.length}\n`);
      return;
    }

    const answer = await askQuestion(query);

    console.log(`\n${bold}${green}💡 Respuesta:${reset}\n`);
    console.log(`   ${answer}\n`);
  } catch (error) {
    console.log(`\n${red}❌ Error al procesar la pregunta:${reset}`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
  }
}

function promptUser(
  prompt: string = 'Elige una opción (1/2/3/4/5): ',
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  showBanner();

  let running = true;
  while (running) {
    showMenu();
    const choice = await promptUser();

    switch (choice) {
      case '1':
        await handleEmbedDocuments();
        break;
      case '2':
        await handleAuditDocuments();
        break;
      case '3':
        await handleSearchQuery();
        break;
      case '4':
        await handleAskQuestion();
        break;
      case '5':
        console.log(`\n${bold}${green}¡Hasta luego! 👋${reset}\n`);
        running = false;
        break;
      default:
        console.log(`\n${red}Opción no válida. Usa 1, 2, 3, 4 o 5.${reset}`);
    }
  }
}

main().catch(console.error);
