# University Header Redesign

## Phase 1 Requirements

- Current look and feel updated which includes:
    - Replacing the sprite sheet buttons with inline SVG icons and text.
    - Replacing the Pegasus with the UCF Stacked logo
    - Increasing the height of the header enough to give the stacked logo room, and likely stacking the "University of Central Florida" text
    - Restyling the search bar and also making it a pop-out feature. A magnifying class icon will indicate that the user can search. When they click on it, the search bar will slide out. When they enter a search and click enter (or click the icon), they will be sent the search.ucf.edu along with their query.
    - The current UCF Sign In tray will be replaced by a single "MyUCF" button that will link users to MyUCF.
- We want to completely modernize the build tools use to manage this project. All scripts should be defined in the package.json file and run with npm.
- The header will need to be embedded on sites using a single javascript file exactly the way it is now. This will be a drop-in replacement of the current header tool.
- The initial load of the header needs to be fast. For this reason, I want to ensure the delivered asset is as small as possible. It should also only concern itself with the rendering of the header itself first and foremost, deferring all additional logic until after the dom has loaded. For example, we plan to continue loading Google Analytics in this phase, but I would like to defer the analytics logic to until after the DOM has loaded. This script should not be blocking after the header is visible on the page.
- We intend to eventually try to add an logged in view of this product, although it will not happen until a later phase. That said, we want to architect the project accordingly so that we can easily add the feature in the future. When the user is logged in, a light weight backend may need to provide some meta data to the script (such as their name and quick links), so we'll want to be prepared to support that. Users will be identified by logging into an SSO endpoint, so we will need a backend to handle the SSO logic. Again, we will not be handling that in this phase, but we need to prepare for it.
- We want to have a testing suite implemented for the project that includes visual regression tests. Early in the process, look and feel will change quite a bit, but once we're settled on the initial look, the look/feel of the header should be locked in for a very long time.
- Browser compatibility: We plan on supporting all major modern browsers (we will not be taking special considerations for Internet Explorer). We will want to make sure tests run across multiple browsers. This header runs on almost every website across the UCF web infrastructure, so it is important that is runs fast, bug free and looks as we intend across all browsers.
- We'll want to update our documentation page (the index.html file in the current project) to the reflect the changes we've made, along with updating the styles used on it to reflect our new brand look.
