# Unmaintained
I programmed this a while ago to find a way of describing something so that all the relevant words (or rather concepts) are present in the description.
This can allow marketing to not miss out on people that are searching for your offer while using the "wrong" words.
It also orders those words from most to least frequently searched.


# Synordle

Synorlde takes a file with a list of source words. (cat 'source_words.json' = ["Foo", "Bar"])
It will query a database for synonymes for each of those words.
Then it will concatenate all found words and the source words and query google trends for their 'interest over time'.
The result of those individual queries will be saved in an 'interestOverTime' folder.
Then it will query for searches related to the words in the concatenated list and save them in a 'relatedQueries' folder.
Then it will take all those results and generate a 'synordle.csv' file relating all queries to each other, thus allowing the user to see wich of the given words or synonymes is the most searched for and it will also generate a table of related search queries to give some context of the individual searches.

Run this to see possible commands:
```
$ run npm tscStart -- --help
```


# Calculation
Perform several search queries where one term remains constant and the others change.
For example: A, B and A, C

Then read the average values of the terms and divide "the others" that always change by "the one" that always remains constant.
For example: B / A and C / A

By doing this, you constantly put "the others" in relation to "the one" that always remains constant and achieve comparability of all values from all queries.
"The One" value __roughly__ forms the center, i.e., 100% = 1.0 of search frequency.
Therefore, if you get 1.48 for B / A as an example, it means that B was searched 48% more frequently than A.

-> Keep in mind that this will not lead to perfect results. Google is offering this, but they made it less accurate on purpose as there are never any absolute interest values but only relative ones. The calculations do their best to stich it back together but in the end it's just resonable guestimation so take the results with a grain of salt and rather as inspuration.
