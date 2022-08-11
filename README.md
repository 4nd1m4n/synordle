# Synordle

Synorlde takes a file with a list of source words. (cat 'source_words.json' = ["Foo", "Bar"])
It will query a database for synonymes for each of those words.
Then it will concatenate all found words and the source words and query google trends for their 'interest over time'.
The result of those individual queries will be saved in an 'interestOverTime' folder.
Then it will query for searches related to the words in the concatenated list and save them in a 'relatedQueries' folder.
Then it will take all those results and generate a 'synordle.csv' file relating all queries to each other, thus allowing the user to see wich of the given words or synonymes is the most searched for and it will also generate a table of related search queries to give some context of the individual searches.
