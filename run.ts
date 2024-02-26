import fs from'node:fs';
import { MarkdownNodeParser, SimpleDirectoryReader, SimpleNodeParser, Document } from 'llamaindex';
import { extractMetadata } from './lib/rag/metadata';
import { createVectorIndex } from './lib/rag/vector-index';
import { createSummaryIndex, getSummaryIndex } from './lib/rag/summary-index';
import { createDocumentAgent, createTopAgent } from './lib/rag/agents';
import * as llamaParse from './lib/rag/llama-parse';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoKVStore } from './lib/rag/store/mongo-kvstore';
import KVDocumentStore from './lib/rag/store/kv-document-store';
import { KVIndexStore } from './lib/rag/store/kv-index-store';

const reader = new SimpleDirectoryReader();
const documents = await reader.loadData('/Users/andrej.kovcic/dev/ds/spark-pilot/example-docs/samples4');

const run = async () => {
  const file = fs.readFileSync('/Users/andrej.kovcic/dev/ds/spark-pilot/example-docs/samples4/bcce52d8-7202-4217-8f86-8523b96c9755.md');
  const text = file.toString('utf8');
  const documents = [new Document({ text })];

  // const parser = SimpleNodeParser.fromDefaults({
  //   chunkSize: 1024,
  //   chunkOverlap: 20,
  //   includeMetadata: true,
  //   includePrevNextRel: true,
  // });
  // const parser = MarkdownNodeParser.fromDefaults();
  // const nodes = parser.getNodesFromDocuments(documents);
  // console.info(nodes.length);
  // nodes.forEach((doc) => {
  //   console.info(doc);
  //   console.log('-------------------');
  // });

  // const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  //   chunkSize: 1024,
  //   chunkOverlap: 20,
  // });
  // const output = await splitter.createDocuments([text]);

  // output.forEach((doc) => {
  //   console.info(doc);
  //   console.log('-------------------');
  // });

  // const metadata = await extractMetadata(documents);
  // const vectorIndex = await createVectorIndex('test', nodes);
  // const vectorIndex = await getVectorIndex('test');
  // const queryEngine = vectorIndex.asQueryEngine();
  // const response = await queryEngine.query({ query: 'what is H2SO4?' });
  // console.log(response);

  // const summaryIndex = await createSummaryIndex('test', documents);
  // const summaryIndex = await getSummaryIndex('test');
  // const queryEngine = summaryIndex.asQueryEngine();
  // const response = await queryEngine.query({ query: 'how the presence of ES affects to corrosion of stainless steal?' });
  // console.log(response.response);

  // const metadata = await extractMetadata(nodes);
  // console.info(metadata);

  const agent = await createDocumentAgent('424eea88-7d36-4b35-8d94-1583864980b1', 'Langmuir Adsorption Isotherm and Corrosion Inhibition of Stainless Steel by Egg Shell in Sulphuric Acid Medium');
  // const response = await agent.query({ query: 'how the presence of ES affects to corrosion of stainless steal?' });
  const response = await agent.query({ query: 'what bc value for Inhibitor concetration of 2g' });
  console.info("response:", response.response);
  console.info("sources:", response.sources);

  // const agent = await createTopAgent('2f52344c-746a-4b2e-8f85-471ffce552a3');
  // const response = await agent.query({ query: 'how the presence of ES affects to corrosion of stainless steal?' });
  // const response = await agent.query({ query: 'what bc value for Inhibitor concetration of 2g' });
  // console.info(response.response);
  // console.info(response.sources);

  // const file = fs.readFileSync('/Users/andrej.kovcic/dev/ds/spark-pilot/example-docs/samples4/bcce52d8-7202-4217-8f86-8523b96c9755.pdf');
  // const blob = new Blob([file], { type: 'application/pdf' });

  // const id = await llamaParse.upload(blob);

  // let status;
  // while (status !== 'SUCCESS') {
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   status = await llamaParse.check(id);
  // }

  // const result = await llamaParse.result(id, 'markdown');

  // fs.writeFileSync('/Users/andrej.kovcic/dev/ds/spark-pilot/example-docs/samples4/bcce52d8-7202-4217-8f86-8523b96c9755.md', result);

  // console.info('documents:', documents);

  // const kvstore = new MongoKVStore('mongodb://localhost:27017', 'test');

  // const docStore = new KVDocumentStore(kvstore);
  // await docStore.addDocuments(documents);
  // await docStore.deleteDocument('1c68e5d8-a33c-4496-aa92-64f53349e3d5')
  // const doc = await docStore.getDocument('18c74bcb-4014-4d10-8159-2a3ac0e0f687')
  // console.info('done', doc);

  // const indexStore = new KVIndexStore(kvstore, 'test')
}

run();
