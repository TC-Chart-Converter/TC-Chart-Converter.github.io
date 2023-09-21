# Contributing

~~I just make these rules up as I go~~

I accept Pull Requests (PRs/MRs) on Github. Following procedure is on the honor system.

I may make small changes to PRs without consulting, unless explicitly instructed not to.

The standards below are non-exhaustive but I will update them when relevant.

## Checklist

[] PR contains a single logical change - Avoid bundling many changes together as they're harder to review
[] Changes and basic functionality are tested
  - Open the HTML locally and verify it renders correctly and does not produce console messages (errors, warnings, logs)
  - If changing anything other than HTML and CSS, test a known working MIDI. I use Snow Halation, whose MIDI is at
    `/test/sno.mid` and TMB is at `/test/sno.tmb`. The 
    - Upload the MIDI in the top box and select tccc slide mode
    - Upload the TMB in the second box and ensure the right settings get loaded
    - Ensure the preview looks correct
    - Generate the chart and play it in TC
  - If adding a new feature or changing an existing one, test a MIDI that uses the feature
[] Style matches existing code (See style guide below)
[] Changelog is updated in the PR
  - Increment the suffix letter for a tiny change that does not impact features, or a bugfix
  - Increment the minor version for a change that adds or alters a feature beyond a bugfix
  - I will determine when to increment the major version
[] For feature contributions: Contributor is named in the footer - Add your name if it's not already there
  - For bugfixes: Github will add your name to the contributors list but you do not get to appear on the page
[] PR comment contains a summary of the changes and why they are being made
  - Example: "Fixes bug where colors with R, G, or B values under 16 could import as black"
  - Example: "Treats noteOn events with velocity 0 as noteOff events: Some DAWs (including Reaper) use this convention"

## Style

Match the existing style. The below is not an exhaustive list.

- Spacing:
  - Indentation increases by two spaces in all contexts when it increases
  - No space on empty lines
  - No trailing spaces
- Naming
  - Modules use PascalCase
  - Functions and JS variables use camelCase
  - HTML ids and classes use lowercase
- Line length: Try to keep things within 120 chars whenever possible
- Always use `"` and never `'`
