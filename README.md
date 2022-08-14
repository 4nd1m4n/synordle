# Synordle

Synorlde takes a file with a list of source words. (cat 'source_words.json' = ["Foo", "Bar"])
It will query a database for synonymes for each of those words.
Then it will concatenate all found words and the source words and query google trends for their 'interest over time'.
The result of those individual queries will be saved in an 'interestOverTime' folder.
Then it will query for searches related to the words in the concatenated list and save them in a 'relatedQueries' folder.
Then it will take all those results and generate a 'synordle.csv' file relating all queries to each other, thus allowing the user to see wich of the given words or synonymes is the most searched for and it will also generate a table of related search queries to give some context of the individual searches.

# TODO

// $ run npm tscStart -- --help

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

// Ich habe die Anfragen nur mit den Ausganswörtern gemacht, es fehlen aber die ganzen Synonyme!!!
