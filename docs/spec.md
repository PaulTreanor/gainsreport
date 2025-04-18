# GainsReport Spec

GainsReport is a workout log viewing webapp that pulls data in from a public markdown file hosted on GitHub (or anywhere really, just a URL). This file is updated after each workout. The file follows a specific schema so the app can easily parse the data to give insights and display the workout log in a nice way. 

### Displaying workouts 
The app should display workouts as part of a timeline where each workout appears as a card. It should be obvious if workouts are in the same week (I'd like this delineated). The app loads displaying the most recent workout (ie. at the bottom of the page). It's not possible to edit workouts, it's just for displaying data etc. Format the dates of workouts into day of the week, then date ie. "Thursday 17th April 2025".

In a given line item in a workout it should make it clear when a specific entry is a personal record for a given rep max for an exercise. 

### Data section 
I want a separate tab called "insights" including various sections. 

- The number of weeks I've worked out in a row
- A section listing per-exercise PRs for each rep max up to 12. Each of these should be hidden unless expandable. Obviously most will be empty at first. Exercises will be populated from the MD file. 
- An item telling me the days since I last worked out
- An item telling me 5 exercises I haven't improved on in a while
