// npx tsc app.ts && node app.js > synonym-wordlist.csv

/*
  Berechnung:
  Man mache mehrere Suchanfragen wobei 1 Begriff immer gleich bleibt und die anderen sich ändern. z.B.: A, B und A, C
  Dann liest man die Durchschnittswerte der Begriffe aus und Teilt "die anderen" sich immer ändernden durch "den einen" der immer gleich bleibt. z.B.: B / A und C / A
  Dadurch setzt man "die anderen" immer wieder ins Verhältnis zu "dem einen" der immer gleich bleibt und erreicht so eine Vergleichbarkeit aller Werte aus allen Anfragen.
  "Der Eine" Wert bildet dabei das Zentrum, also die 100% = 1,0 der Suchhäufigkeit.
  Erhält man also bei B / A zum Beipsiel 1,48, dann bedeutet das, dass B 48% häufiger gesucht wurde als A. */

// man könnte über die related queries schauen, ob es noch weitere 'synonyme' gibt, die man der Wortliste hinzufügen könnte
// oder man könnte den Suchbegriff mit den related queries in kontrast setzen und sehen, ob andere/ähnliche Suchen viel beliebter sind -> denn interest over time ist immer nur relativ zum Höhepunkt den der Suchbegriff mal hatte ... also könnte ich erst einen query machen der prüft welche related queries es gibt und dann könnte ich ein interest over time query mit dem Suchbegriff und den ähnlichen anderen Begriffen machen und sehen, ob unser bisheriger Suchbegriff ein guter/der beste Kandidat ist.
// eventuell kann man so auch die Nieten unter den Begriffen heraus finden, man kann immer maximal 5 Begriffe miteinander vergleichen, damit kann ich eventuell was bauen, was dafür sorgt, dass mindestens jeder Begriff mal mit jedem anderen im Verhältniss stand und dann sortieren... wird aber hart kompliziert...
// eventuell ist es einfacher zu schauen, welche Begriffe an Fahrt aufnehmen und welche immer weniger gesucht werden, daran lässt sich eventuell auch erkennen, was gerade in Mode ist.

const mysql = require("mysql");
const googleTrends = require("google-trends-api");
const fs = require("fs");
const path = require("path");

const openthesaurusDbConfigFilename = "openthesaurus-db-config.json";
const openthesaurusDbConfig = JSON.parse(
  fs.readFileSync(openthesaurusDbConfigFilename)
);
// i.e. { host: "localhost", user: "root", password: "**your-db-password-here**", database: "openthesaurus" }

// Ich habe die Anfragen nur mit den Ausganswörtern gemacht, es fehlen aber die ganzen Synonyme!!!

let sourceWordsJsonFilename = "source_words.json";
// i.e. [ "Telephone", "Mobile", "App", "Application" ]
let sourceAndSynonymWordsJsonFilename = "source_and_synonym_words.json";

// max on google is 4 + the 1 norming word = 5 words max per query
const relateWordsPerQuery = 4;
const interestOverTimeResultsDirectory = "iot_test_2";
const relatedQueriesResultsDirectory = "rq_test_1";

// MAIN
(async function main() {
  if (processCommandLineArguments()) return 0;
  let sourceWords = loadSourceWords();
  console.log("# Loaded source words\n", sourceWords);

  gatherSynonymes(
    openthesaurusDbConfig,
    sourceWords,
    sourceAndSynonymWordsJsonFilename
  );

  gatherInterestOverTime(sourceWords, interestOverTimeResultsDirectory);
  relateAllIotRequests(interestOverTimeResultsDirectory);
  // writeAllIotDataToCsvFile();

  gatherRelatedQueries(sourceWords, relatedQueriesResultsDirectory);
  // writeAllRqDataToCsvFile();

  console.log("\n# Done, exiting...");
})();

// returns true when programm should stop continuing
function processCommandLineArguments() {
  let args = process.argv.slice(2);

  while (args.length > 0) {
    console.log(`args = ${args}`);
    switch (args[0]) {
      case "--help":
        console.log(
          `# This is the help of 'synordle.

Synorlde takes a file with a list of source words. (cat 'source_words.json' = ["Foo", "Bar"])
It will query a database for synonymes for each of those words.
Then it will concatenate all found words and the source words and query google trends for their 'interest over time'.
The result of those individual queries will be saved in an 'interestOverTime' folder.
Then it will query for searches related to the words in the concatenated list and save them in a 'relatedQueries' folder.
Then it will take all those results and generate a 'synordle.csv' file relating all queries to each other, thus allowing the user to see wich of the given words or synonymes is the most searched for and it will also generate a table of related search queries to give some context of the individual searches.`
        );
        args = args.slice(1);
        return true;

      case "-s":
        sourceWordsJsonFilename = args[1];
        console.log(
          `Using ${sourceWordsJsonFilename} as souce word json file.`
        );
        args = args.slice(2);
        break;

      default:
        console.log(
          `Got argument '${args[0]}' wich is unknown.\nCall this script with '--help' to get usage information.`
        );
        args = args.slice(1);
        return true;
    }
  }

  return false;
}

async function gatherSynonymes(
  dbConfig,
  words: string[],
  resultsFilename: string
) {
  const connection = createConnection(dbConfig);
  await connect(connection);
  console.log("# Connected to MySQL Server!");

  const synonymes = await getSynonyms(connection, words);
  const uniqueSynonymes = uniqueFlattenedSynonymes(synonymes);

  writeJsonToFile(uniqueSynonymes, resultsFilename);
  console.log(`# Wrote JSON file '${resultsFilename}'.`);

  connection.end();
}

async function gatherInterestOverTime(
  words: string[],
  resultsDirectory: string
) {
  createDirectories([resultsDirectory]);
  console.log(`# Created directories ${[resultsDirectory]} successfully!`);

  const givenWords = words;
  const normingWord = givenWords[0];

  if (givenWords.length < 1)
    return console.error("To few elements to relate to one another.");

  for (let index = 1; index < givenWords.length; index++) {
    const toRelateWords = subArray(givenWords, index, relateWordsPerQuery);
    const keywords = [normingWord].concat(toRelateWords);

    await sleep(3000);

    await requestInterestOverTime(keywords)
      .then(function (results) {
        const resultsJson = JSON.parse(results);
        console.log(resultsJson);

        const filename = `${resultsDirectory}/${keywords.join("_")}.json`;
        writeJsonToFile(resultsJson, filename);
        console.log(`# Wrote JSON file '${filename}'.`);
      })
      .catch(function (err) {
        console.error("Oh no there was an error", err);
      });
  }
}

function relateAllIotRequests(sourceDirectory: string) {}

async function gatherRelatedQueries(words: string[], resultsDirectory: string) {
  createDirectories([resultsDirectory]);
  console.log(`# Created directories ${[resultsDirectory]} successfully!`);

  for (let index = 0; index < words.length; index++) {
    const keyword = words[index];

    await sleep(3000);

    googleTrends
      .relatedQueries({
        keyword: keyword,
        geo: "DE",
        hl: "de",
      })
      .then(function (results) {
        // console.log("These results are awesome");
        // console.log(JSON.stringify(JSON.parse(results), null, "  "));
        const readableResults = JSON.stringify(JSON.parse(results), null, "  ");
        console.log(readableResults);

        const filename = `${resultsDirectory}/${keyword}.json`;
        fs.writeFile(filename, readableResults, "utf8", function (err) {
          if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
          }

          console.log(`JSON file '${filename}' has been saved.`);
        });
      })
      .catch(function (err) {
        console.error("Oh no there was an error", err);
      });
  }
}

function loadSourceWords(): string[] {
  let sourceWordsJsonString = fs.readFileSync(sourceWordsJsonFilename);
  let sourceWords = JSON.parse(sourceWordsJsonString);
  return sourceWords;
}

function createDirectories(directories: string[]) {
  directories.forEach((directory) => {
    const fullPath = path.join(__dirname, directory);
    if (fs.existsSync(fullPath))
      console.log(`The directory ${fullPath} already exists`);
    else fs.mkdirSync();
  });
}

function uniqueFlattenedSynonymes(listOfSynonymes) {
  return listOfSynonymes.reduce((accumulated, synonymes) => {
    synonymes.forEach((synonym) => {
      const word = synonym.word;
      if (!accumulated.includes(word)) accumulated.push(word);
    });
    return accumulated;
  }, []);
}

function writeJsonToFile(json, file) {
  fs.writeFileSync(file, JSON.stringify(json, null, "  "), "utf8");
}

function requestInterestOverTime(keywords: string[]) {
  return googleTrends.interestOverTime({
    keyword: keywords,
    geo: "DE",
    hl: "de",
  });
}

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function subArray(array, start, count) {
  return array.filter((_, index) => {
    return index >= start && index < count + start;
  });
}

function buildSqlQuery(word: string) {
  return `SELECT term.word FROM term, synset, term term2 WHERE synset.is_visible = 1 AND synset.id = term.synset_id AND term2.synset_id = synset.id AND term2.word = '${word}';`;
}

function getSynonyms(connection, sourceWords) {
  return Promise.all(
    sourceWords.map(async (word) => {
      const sqlQuery = buildSqlQuery(word);
      return (await query(connection, sqlQuery)) as Array<{
        word: string;
      }>;
    })
  );
}

function createConnection(config) {
  return mysql.createConnection(config);
}

function connect(connection) {
  return new Promise<void>((resolve, reject) => {
    connection.connect((error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

async function query(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, result, fields) => {
      if (error) reject(error);
      return resolve(result);
    });
  });
}
