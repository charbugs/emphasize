
:tada: Emphasize brings advanced text search tools to your browser. :bird:

[Install from Chrome Web Store](https://chrome.google.com/webstore/detail/emphasize/akkppidlpcckbggkbbkfjobkaahbgajk)

## Overview

#### What is Emphasize?
Emphasize is a browser extension for Chrome that provides **advanced text search tools**. These tools can be applied to any web page that is loaded in the browser. As a result, text sections of the web page will be annotated. **Annotations** can comprise two things:

* Highlightings of text sections
* Comments that will be shown as little popups near the highlighted text sections

#### Give me an example!

For example, such a tool may highlight technical terms in a web page and provide a short explanation for each of these terms that will be shown as popups near them.

#### Emphasize is extensible

Emphasize is extensible, i.e. people can write their own text search tools and integrate them into the extension. In this regard, Emphasize is meant as an framework for the development of text analysis tools that work in the browser. Emphasize aims to make this easy by taking care of some common tasks like extracting web page text, splitting text into words, converting search results into visible annotations etc.

#### What is a marker?

Text search tools integrated in Emphasize are called markers. A marker is a program that takes a list of words (the web page text) as input and outputs indications which of these words (or sequences of words) should be annotated. Emphasize then converts these indications into visible annotations within the web page.

#### How are markers integrated into Emphasize?

A marker is a web service listening on an HTTP URL. This way, a marker can be integrated into Emphasize. When a marker is registered with Emphasize, the marker supplies its setup, which determines how the marker will be displayed within the user interface of Emphasize and what information the marker expects from the user to work properly (e.g. a search term). When the user applies a marker to a web page, Emphasize connects to the marker, passes the web page text and other information, waits for the results of the marker's analysis and converts these results into visible annotations within the web page text.

#### What programming language are markers written in?

As Emphasize and markers talk to each other over HTTP, a marker can be written in almost any programming language, as long as the marker adheres to the communication protocol that Emphasize defines for data exchange.

#### Users can register and remove markers

Markers can be registered with Emphasize by entering their URL via the user interface. Emphasize will then request the setup of the marker and perform some validation checks. If everything is ok, the marker will be shown in the marker list of the user interface and can be applied to a web page. Likewise, markers can be removed from Emphasize.

#### Public and local markers

A marker can be public to each user of Emphasize if the URL the marker is listening on is a public URL. Conversly, a marker can be for private or for testing use if listening on a local URL.

#### Where to find public markers?

Currently, there is no standard way of finding public markers. I plan to create a repository where developers can publish markers so that users can search that repository and register markers with their instance of Emphasize. For now, I provide a simple [list of public markers](#list-of-public-markers) on this page.

## Installation

* [Emphasize can be installed from Chrome Web Store](https://chrome.google.com/webstore/detail/emphasize/akkppidlpcckbggkbbkfjobkaahbgajk)

* You need **Chrome Version 55 or later**

* **Note** that Emphasize cannot be found by searching the Web Store. This is because Emphasize is currently a **beta version**. So you have to follow the link above.



## Usage

### Applying a marker to a web page

* Open the user interface through the toolbar button. You will see a list of registered markers.

* Click on a marker and you will be led to the marker view.

* In the marker view, you will see a description of the marker's purpose and perhaps some usage hints.

* Some markers want you to enter some information, like a search term, before you can apply them.

* Apply a marker to the current web page by clicking the apply button.

* If everthing went well, Emphasize will annotate the web page text.

### Working with highlightings

* For the sake of differentiation, each marker has its own unique color. This color appears in highlightings as well as in some places in the user interface.

* You can temporarily hide the highlightings of a marker by switching the toggle button.

* You can reset a marker, which means that the highlightings will be removed from the web page.

* You can apply multiple markers to a web page at the same time. Text sections that are targeted by two or more markers will have a gray background.

* Note that, at the moment, Emphasize lacks the ability to navigate through the highlightings on the web page.

### Working with commenting popups

* Some markers will add comments to the highlighted parts of the web page text.

* These comments become visible as little popups if you click on the highlighted text.


### Registering a marker with Emphasize

* Switch to the registration tab in the user interface.

* Enter the URL of the marker into the input field and click the register button.

* If there was an issue while requesting the setup, Emphasize will show an error message.

* If everything went well, the marker will be visible in the marker list.


### Updating markers

* Markers will be updated automatically when the browser starts.

## List of Public Markers

Here is a list of public markers that can be registered with Emphasize. Just copy the URL and enter it in the registration tab of Emphasize.

---

**Regular Expression Search**

This marker highlights words on a web page that match a given regular expression.

`http://h2706860.stratoserver.net/em-regex-search`

Supported languages: any

---

**Persons, Locations, Organisations**

This marker highlights words that refer to Persons, Locations and Organisations.

`http://h2706860.stratoserver.net/em-named-entities`

Supported languages: English, German

---

**Web Page Comparison**

This marker highlights text similarities between a web page and another to compare with. It will also show snippets of the corresponding text parts of the other page.

`http://h2706860.stratoserver.net/em-text-similarities`

Supported languages: German

---

**Synonym Marker**

This marker highlights synonyms of a given search term.

`http://h2706860.stratoserver.net/em-synonym-search`

Supported languages: German

---

## Writing markers for Emphasize

### Communication protocol overview

Emphasize has a simple communication protocol for data exchange. This protocol wants a marker to implement a small HTTP API. Here are the basics:

* **base url**: A marker has a base URL with which the marker can be registered with Emphasize, e.g. `http://mymarkers.com/synonym-detection`

* **setup request**: When a user registers a marker, Emphasize will perform a GET request to `<base url>/setup`, e.g. `http://mymarkers.com/synonym-detection/setup`

* **setup response**: When a marker receives a setup request, it should return a JSON object that contains the setup features like title, description etc.

* **markup request**: If a marker is registered with Emphasize, a user can apply the marker to a web page. In this case, Emphasize will perform a POST request to `<base url>/markup`, e.g. `http://mymarkers.com/synonym-detection/markup`. The HTTP body of this request is a JSON object that contains the text of the web page and some other information, like user inputs.

* **markup response**: When a marker receives a markup request from Emphasize, it should return a JSON object that contains indications which parts of the web page text should be annotated. The response can also contain an analysis report or an error message for cases in which the marker was unable to process the data.

### Setup request

|             |                              |
| ----------- | ---------------------------- |
| Description | Requests the marker setup |
| Agent       | Emphasize                    |
| Method      | GET                          |
| URL         | `<base url of marker>/setup` |


### Setup response

|             |                                   |
| ----------  | --------------------------------- |
| Description | Sends the marker setup            |
| Agent       | Marker                            |


Here is an example of how the HTTP body of a setup response may look like:

```Javascript
{
  "title": "Synonym Marker", 
  "description": "Highlights synonyms of the search term within the web page text.",
  "supportedLanguages": "English",
  "author": "Jane Doe",
  "homepage": "https://github.com/janedoe/synonym-detection",
  "inputs": [
    {
      "id": "search_term",
      "type": "text",
      "label": "Give me a search term"
    }
  ]
}
```

The content of a setup response is a JSON object that must contain at least a `title` and a `description` for the marker. Title and description will be shown in the user interface of Emphasize. The `author`, `homepage` and `supportedLanguages` fields provide additional information but have no further impact on the functionality of the marker.

By means of the `inputs` field, the marker defines that there should be a text input form in the corresponding marker view of the user interface so that the user can enter data (a "search term" in the example) before applying the marker. As you can see, the `inputs` field is an array, which means that a marker can define multiple input forms. It's also possible to define a selection form, e.g.;

```Javascript
{
  ...
  "inputs": [
    {
      "id": "language",
      "label": "Choose a language",
      "type": "select",
      "values": ["English", "French", "German", "Spanish"]
    }
  ]
}
```

### Markup request

|             |                                       |
| ----------- | ------------------------------------- |
| Description | Requests analysis results of a marker |
| Agent       | Emphasize                             |
| Method      | POST                                  |
| URL         | `<base url of marker>/markup`         |
| HTTP body   | Web page text and other informations as JSON |

Here is an example of how the HTTP body of a markup request may look like:

```Javascript
{
  "tokens": ["I", "was", "talking", "to", "the", "cast", "half", "an", "hour", "ago", ",", "before", "the", "break", "for", "dinner", "started", ",", "Bezos", "said", "on", "stage", "at", "the", "conference", "."],
  "url": "https://www.cnet.com/news/jeff-bezos-amazon-rescues-the-expanse-from-cancellation",
  "inputs": { "search_term": "say" } 
}
```

The content of a markup request is a JSON object that contains the `tokens` (words, punctuation etc.) of the web page the marker should be applied to. It also contains the `url` of the web page as an additional piece of information. If the marker has defined input forms in the setup, the markup request will provide an `inputs` object that contains the user input data. Each key of this object refers to the ID of the input form given in the marker's setup. The values of this object hold the user input data.

### Markup response 

|             |                                   |
| ----------  | --------------------------------- |
| Description | Sends analysis results            |
| Agent       | Marker                            |

Here is an example of how the HTTP body of a markup response may look like:

```Javascript
{
  "markup": [
    { "tokens": [2, 19] }
  ],
  "report": "Found 2 synonyms for the search term: say"
}
```

The content of a markup reponse is a JSON object that holds the analysis results of the marker. The `markup` field is an array of objects that contains indications which text sections of the web page should be annotated. In the example the marker wants token number 2 ("talking") and 19 ("said") of the web page text to be highlighted. That is, a marker refers to text sections through the indices of the tokens list comming with a markup request. Note that the indices start at 0. Furthermore, there is an optional `report` field that is shown in the user interface after the marker was successfully applied.

The `markup` array can contain multiple objects that indicate the annotations and these objects can have 4 different formats:

```Javascript
{
  "markup": [
    { "token": 2 },                               // highlights token 2
    { "tokens": [19, 23, 34] },                   // highlights token 19, 23, 34
    { "group": { "first": 52, "last": 66 } },     // highlights token 52 to 66 as a sequence
    { "groups": [                                 // highlights two groups as two sequences
      { "first": 70, "last": 73 }, 
      { "first": 52, "las"t: 66 } 
    ]},
  ]
}
```

If we want to add a comment to a highlighted text section, we must add a `gloss` field to the the corresponding object:

```Javascript
{
  "markup": [
    { 
      "token": 2, 
      "gloss": "This comment will be shown as a popup next to token 2." 
    },
    { 
      "tokens": [19, 23, 34],
      "gloss":  "This comment causes one popup for each of the tokens 19, 23, 34."
    }
  ]
}
```

Finally, a markup response can contain a error message that is displayed to the user:

```Javascrip
{
  "error": "You should give me a search term."
}
```

### Some fields can contain HTML

The `gloss` and `report` field of a markup response as well as the `description` field of a setup response can contain HTML that Emphasize tries to render in the respective place (popups and user interface). Note three things here:

* Always wrap strings containing HTML in a `<div>` element.

* The set of HTML elements is restricted, whereas the `description` field is more restricted (only text layout elements like `<b>`, `<ul>`, `<li>` etc. are allowed) than the `gloss` and `report` fields (can also contain `<img>`, `<audio>`, `<video>`). Some elements like `<script>` and `<style>` are generally disallowed.

* Invalid HTML will be striped from the strings

### Example implementation of a marker

Here is an example implementation of a simple *regular expression marker* written in Python. The purpose of this marker is to highlight words that match a regular expression given by the user. I use the web framework Flask to set up the server. It is a local marker that can be registered with Emphasize using the the base URL: `http://127.0.0.1:8080/regex` or `http://localhost:8080/regex`.

```Python
from flask import Flask, request, Response
import json
import re

app = Flask(__name__)

@app.route('/regex/setup', methods=['GET'])
def handle_setup_sequest():
    data = get_setup()
    return create_response(data);

@app.route('/regex/markup', methods=['POST'])
def handle_markup_request():
    data = get_markup(request.json)
    return create_response(data);

def create_response(data):
    resp = Response() 
    resp.data = json.dumps(data)
    resp.headers['Content-Type'] = 'application/json'
    return resp

def get_setup():
    return {
	'title': 'Regular Expression Search',
	'description': "Find words that match a regular expression.",
	'inputs': [
	    {
		'id': 're',
		'type': 'text',
		'label': 'Regular Expression',
	    }
	]
    }

def get_markup(markup_request):

    tokens = markup_request['tokens']
    pattern = markup_request['inputs']['re']

    if not pattern:
	return { 'error': 'You should give me a pattern.' }

    tokens_to_mark = []

    for i in range(len(tokens)):
	if re.search(pattern, tokens[i]):
	    tokens_to_mark.append(i) 

    report = '%d of %d tokens match the pattern: %s' % (
	len(tokens_to_mark), 
	len(tokens), 
	pattern
    )

    return { 
	'markup': [ { 'tokens': tokens_to_mark } ], 
	'report' : report 
    }

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
```
