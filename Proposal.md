# Project Title

Ventr - Vent what's hard to share with an indifferent AI

## Overview

What is your app? Give a brief description in a couple of sentences.

Venter is a simple app that takes in a 'vent', some frustration or complaint, and uses an llm to output both a supportive and unsupportive reply simultaneously.

### Problem Space

Why is your app needed? Give any background information around any pain points or other reasons.

The hope is that this app allows the user to get a 'frustration' out of their system, like writing a line in a journal, in a judgement free medium, that can also simultaneously challenge the thought. If one's frustration leads down a negative line of reasoning, providing both a supportive and unsupportive comment could simultaneously validate that reasoning while adding a (novel) line of positivity to associate with the 'vent'.

### User Profile

Who will use your app? How will they use it? Add any special considerations that your app must take into account.

Anyone who is bogged down with frustrations. Frustrated about, for example, the state of the world, soul-crushing compulsory labor, or a minor sour spot in their day like getting cut in line by a stranger. 

### Features

List the functionality that your app will include. These can be written as user stories or descriptions with related details. Do not describe _how_ these features are implemented, only _what_ needs to be implemented.

The app requests a 'frustration' or 'vent' from the user.
The app responds with both a supportive comment (section), and an unsupportive, egging and antagonizing (section).

## Implementation

### Tech Stack

List technologies that will be used in your app, including any libraries to save time or provide more functionality. Be sure to research any potential limitations.

react, axios

### APIs

List any external sources of data that will be used in your app.

an llm api such as chatgpt for text. 
potentially an llm api for image generation.

### Sitemap

List the pages of your app with brief descriptions. You can show this visually, or write it out.

promt page,
reply page

### Mockups

Provide visuals of your app's screens. You can use pictures of hand-drawn sketches, or wireframing tools like Figma.

### Data

Describe your data and the relationships between the data points. You can show this visually using diagrams, or write it out. 

the data demanded is a user promt (vent), with the replies being ai generated. The ai will be guided as to how to respond.

### Endpoints

List endpoints that your server will implement, including HTTP methods, parameters, and example responses.

## Roadmap

Scope your project as a sprint. Break down the tasks that will need to be completed and map out timeframes for implementation working back from the capstone due date. 

---

-create vent input form to send data to llm
-create two response sections that populate after prompted once


## Future Implementations
Your project will be marked based on what you committed to in the above document. Here, you can list any additional features you may complete after the MVP of your application is built, or if you have extra time before the Capstone due date.

-a button to start a next promt
-a list of all the vent(s) expressed
-an option to engage with the supportive or unsupportive line of replies in a continued conversation

